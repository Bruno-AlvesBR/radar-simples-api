import Stripe from 'stripe';
import { CheckoutService } from './checkout.service';

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(),
}));

type StripeMockClient = {
  subscriptions: {
    retrieve: jest.Mock;
    update: jest.Mock;
  };
  invoices: {
    createPreview: jest.Mock;
  };
  products: {
    list: jest.Mock;
    create: jest.Mock;
  };
  prices: {
    list: jest.Mock;
    create: jest.Mock;
  };
  checkout: {
    sessions: {
      create: jest.Mock;
      retrieve: jest.Mock;
    };
  };
  webhooks: {
    constructEvent: jest.Mock;
  };
};

function createChainableQueryResult<T>(value: T) {
  const query: {
    select: jest.Mock;
    lean: jest.Mock;
  } = {
    select: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(value),
  };

  return query;
}

function createUserRecord(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'user-1',
    email: 'cliente@exemplo.com',
    nome: 'Cliente Exemplo',
    ...overrides,
  };
}

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let configService: any;
  let userModel: any;
  let emailService: any;
  let referralService: {
    recordReferralConversionWhenReferredUserSubscribesToPlan: jest.Mock;
  };
  let stripeClient: StripeMockClient;

  beforeEach(() => {
    stripeClient = {
      subscriptions: {
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      invoices: {
        createPreview: jest.fn(),
      },
      products: {
        list: jest.fn(),
        create: jest.fn(),
      },
      prices: {
        list: jest.fn(),
        create: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    const stripeConstructor = (
      jest.requireMock('stripe') as {
        default: jest.Mock;
      }
    ).default;
    stripeConstructor.mockReset();
    stripeConstructor.mockImplementation(() => stripeClient);

    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'STRIPE_SECRET_KEY') {
          return 'stripe-secret';
        }

        if (key === 'FRONTEND_URL') {
          return 'http://localhost:4200';
        }

        return defaultValue;
      }),
    };

    userModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    };

    emailService = {
      sendCheckoutConfirmation: jest.fn(),
      sendPlanCancellationConfirmation: jest.fn(),
      sendPlanUpgradeConfirmation: jest.fn(),
    };

    referralService = {
      recordReferralConversionWhenReferredUserSubscribesToPlan: jest
        .fn()
        .mockResolvedValue(undefined),
    };

    checkoutService = new CheckoutService(
      configService,
      userModel,
      emailService,
      referralService as never
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve bloquear nova assinatura quando o usuário já possui assinatura ativa', async () => {
    (userModel.findById as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          stripeSubscriptionId: 'sub-ativa',
          plano: {
            titulo: 'Controle',
            slug: 'controle',
            valor: 19.9,
            ciclo: 'mensal',
            dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
            dataVencimento: new Date('2026-05-01T00:00:00.000Z'),
          },
        })
      )
    );

    stripeClient.subscriptions.retrieve.mockResolvedValue({
      status: 'active',
    });

    await expect(
      checkoutService.createSession(
        'user-1',
        'cliente@exemplo.com',
        'automacao',
        'anual'
      )
    ).rejects.toThrow('assinatura ativa');

    expect(stripeClient.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('deve confirmar o checkout concluído e persistir a assinatura no usuário', async () => {
    const sessionId = 'session-concluida';

    stripeClient.checkout.sessions.retrieve.mockResolvedValue({
      client_reference_id: 'user-1',
      status: 'complete',
      metadata: {
        planId: 'controle',
        cycle: 'mensal',
      },
      customer: 'cus-confirmado',
      subscription: 'sub-confirmado',
    });

    stripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub-confirmado',
      customer: 'cus-confirmado',
      created: 1_744_000_000,
      status: 'active',
      items: {
        data: [
          {
            id: 'si-confirmado',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 1990,
              metadata: {
                planId: 'controle',
                cycle: 'mensal',
              },
            },
          },
        ],
      },
    });

    (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          _id: 'user-1',
          plano: {
            titulo: 'Controle',
            slug: 'controle',
            valor: 19.9,
            ciclo: 'mensal',
            dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
            dataVencimento: new Date('2026-05-01T00:00:00.000Z'),
          },
        })
      )
    );

    const result = await checkoutService.confirmSession(sessionId, 'user-1');

    expect(result).toEqual(
      expect.objectContaining({
        email: 'cliente@exemplo.com',
        nome: 'Cliente Exemplo',
        plano: expect.objectContaining({
          slug: 'controle',
          ciclo: 'mensal',
        }),
      })
    );
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        stripeCustomerId: 'cus-confirmado',
        stripeSubscriptionId: 'sub-confirmado',
        plano: expect.objectContaining({
          slug: 'controle',
          ciclo: 'mensal',
        }),
      }),
      { new: true }
    );
    expect(
      referralService.recordReferralConversionWhenReferredUserSubscribesToPlan
    ).toHaveBeenCalledWith('user-1');
  });

  it('deve gerar preview com proration quando a assinatura já está ativa', async () => {
    const now = new Date('2026-04-18T12:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    (userModel.findById as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          stripeSubscriptionId: 'sub-ativa',
          plano: {
            titulo: 'Controle',
            slug: 'controle',
            valor: 19.9,
            ciclo: 'mensal',
            dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
            dataVencimento: new Date('2026-05-01T00:00:00.000Z'),
          },
        })
      )
    );

    stripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub-ativa',
      status: 'active',
      trial_end: null,
      metadata: {
        planId: 'controle',
        cycle: 'mensal',
      },
      customer: 'cus_ativo',
      items: {
        data: [
          {
            id: 'si-ativa',
            current_period_start: 1_000_000,
            current_period_end: 2_000_000,
            price: {
              unit_amount: 1990,
              metadata: {
                planId: 'controle',
                cycle: 'mensal',
              },
            },
          },
        ],
      },
    });

    stripeClient.products.list.mockResolvedValue({ data: [] });
    stripeClient.products.create.mockResolvedValue({ id: 'prod-automacao' });
    stripeClient.prices.list.mockResolvedValue({ data: [] });
    stripeClient.prices.create.mockResolvedValue({
      id: 'price-automacao-anual',
    });
    stripeClient.invoices.createPreview.mockResolvedValue({
      total: 3430,
      lines: {
        data: [
          {
            amount: -850,
            parent: {
              subscription_item_details: {
                proration: true,
              },
            },
          },
          {
            amount: 1280,
            parent: {
              subscription_item_details: {
                proration: true,
              },
            },
          },
          {
            amount: 3000,
            parent: {},
          },
        ],
      },
    });

    const preview = await checkoutService.previewUpgrade(
      'user-1',
      'automacao',
      'anual'
    );

    expect(stripeClient.invoices.createPreview).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription: 'sub-ativa',
        subscription_details: expect.objectContaining({
          proration_date: Math.floor(now / 1000),
          items: [
            {
              id: 'si-ativa',
              price: 'price-automacao-anual',
            },
          ],
        }),
      })
    );
    expect(preview.statusAssinatura).toBe('active');
    expect(preview.tipoMudanca).toBe('upgrade');
    expect(preview.planoAtual.slug).toBe('controle');
    expect(preview.planoNovo.slug).toBe('automacao');
    expect(preview.featuresGanhas).toEqual(
      expect.arrayContaining(['Simulador de cenários comparativos'])
    );
    expect(preview.featuresPerdidas).toEqual([]);
    expect(preview.creditoNaoUtilizado).toBeCloseTo(8.5, 2);
    expect(preview.valorProrateado).toBeCloseTo(4.3, 2);
    expect(preview.valorProximaCobranca).toBe(299);
    expect(preview.dataProximaCobranca).toEqual(expect.any(String));
  });

  it('deve rejeitar downgrade ao gerar preview da mudança', async () => {
    (userModel.findById as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          stripeSubscriptionId: 'sub-ativa',
          plano: {
            titulo: 'Automação',
            slug: 'automacao',
            valor: 29.9,
            ciclo: 'anual',
            dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
            dataVencimento: new Date('2027-04-01T00:00:00.000Z'),
          },
        })
      )
    );

    stripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub-ativa',
      status: 'active',
      trial_end: null,
      metadata: {
        planId: 'automacao',
        cycle: 'anual',
      },
      customer: 'cus-ativo',
      items: {
        data: [
          {
            id: 'si-ativa',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 2990,
              metadata: {
                planId: 'automacao',
                cycle: 'anual',
              },
            },
          },
        ],
      },
    });

    await expect(
      checkoutService.previewUpgrade('user-1', 'controle', 'anual')
    ).rejects.toThrow('Não é possível fazer downgrade de plano');

    expect(stripeClient.prices.list).not.toHaveBeenCalled();
    expect(stripeClient.invoices.createPreview).not.toHaveBeenCalled();
  });

  it('deve aplicar upgrade durante o trial sem prorrateio e atualizar o usuário', async () => {
    (userModel.findById as jest.Mock)
      .mockReturnValueOnce(
        createChainableQueryResult(
          createUserRecord({
            stripeSubscriptionId: 'sub-trial',
            plano: {
              titulo: 'Essencial',
              slug: 'essencial',
              valor: 9.9,
              ciclo: 'mensal',
              dataAdmissao: new Date('2026-04-14T00:00:00.000Z'),
              dataVencimento: new Date('2026-04-21T00:00:00.000Z'),
            },
          })
        )
      )
      .mockReturnValueOnce(
        createChainableQueryResult(
          createUserRecord({
            stripeSubscriptionId: 'sub-trial',
            plano: {
              titulo: 'Essencial',
              slug: 'essencial',
              valor: 9.9,
              ciclo: 'mensal',
              dataAdmissao: new Date('2026-04-14T00:00:00.000Z'),
              dataVencimento: new Date('2026-04-21T00:00:00.000Z'),
            },
          })
        )
      );

    const trialSubscription = {
      id: 'sub-trial',
      status: 'trialing',
      trial_end: 1_744_800_000,
      metadata: {
        planId: 'essencial',
        cycle: 'mensal',
      },
      customer: 'cus-trial',
      items: {
        data: [
          {
            id: 'si-trial',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 990,
              metadata: {
                planId: 'essencial',
                cycle: 'mensal',
              },
            },
          },
        ],
      },
    } as unknown as Stripe.Subscription;

    const refreshedSubscription = {
      ...trialSubscription,
      metadata: {
        planId: 'controle',
        cycle: 'mensal',
      },
      items: {
        data: [
          {
            id: 'si-trial',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 1990,
              metadata: {
                planId: 'controle',
                cycle: 'mensal',
              },
            },
          },
        ],
      },
    } as unknown as Stripe.Subscription;

    stripeClient.subscriptions.retrieve
      .mockResolvedValueOnce(trialSubscription)
      .mockResolvedValueOnce(refreshedSubscription);
    stripeClient.products.list.mockResolvedValue({ data: [] });
    stripeClient.products.create.mockResolvedValue({ id: 'prod-controle' });
    stripeClient.prices.list.mockResolvedValue({ data: [] });
    stripeClient.prices.create.mockResolvedValue({
      id: 'price-controle-mensal',
    });
    stripeClient.subscriptions.update.mockResolvedValue({
      id: 'sub-trial',
    });
    (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          _id: 'user-1',
          email: 'cliente@exemplo.com',
          nome: 'Cliente Exemplo',
          plano: {
            titulo: 'Controle',
            slug: 'controle',
            valor: 19.9,
            ciclo: 'mensal',
            dataAdmissao: new Date('2026-04-14T00:00:00.000Z'),
            dataVencimento: new Date('2026-04-21T00:00:00.000Z'),
          },
        })
      )
    );

    const result = await checkoutService.upgradeSubscription(
      'user-1',
      'controle',
      'mensal',
      1_744_000_000
    );

    expect(stripeClient.subscriptions.update).toHaveBeenCalledWith(
      'sub-trial',
      expect.objectContaining({
        proration_behavior: 'none',
        metadata: expect.objectContaining({
          planId: 'controle',
          cycle: 'mensal',
          userId: 'user-1',
        }),
      })
    );
    expect(
      stripeClient.subscriptions.update.mock.calls[0]?.[1]
    ).not.toHaveProperty('proration_date');
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        stripeSubscriptionId: 'sub-trial',
        stripeCustomerId: 'cus-trial',
        plano: expect.objectContaining({
          slug: 'controle',
          ciclo: 'mensal',
        }),
      }),
      { new: true }
    );
    expect(emailService.sendPlanUpgradeConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: 'cliente@exemplo.com',
        currentPlanName: 'Essencial',
        nextPlanName: 'Controle',
      })
    );
    expect(result.plano?.slug).toBe('controle');
    expect(result.plano?.ciclo).toBe('mensal');
    expect(result.plano?.dataAdmissao).toBeInstanceOf(Date);
  });

  it('deve rejeitar downgrade ao tentar alterar a assinatura', async () => {
    (userModel.findById as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          stripeSubscriptionId: 'sub-ativa',
          plano: {
            titulo: 'Automação',
            slug: 'automacao',
            valor: 29.9,
            ciclo: 'anual',
            dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
            dataVencimento: new Date('2027-04-01T00:00:00.000Z'),
          },
        })
      )
    );

    stripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub-ativa',
      status: 'active',
      trial_end: null,
      metadata: {
        planId: 'automacao',
        cycle: 'anual',
      },
      customer: 'cus-ativa',
      items: {
        data: [
          {
            id: 'si-ativa',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 2990,
              metadata: {
                planId: 'automacao',
                cycle: 'anual',
              },
            },
          },
        ],
      },
    });

    await expect(
      checkoutService.upgradeSubscription(
        'user-1',
        'controle',
        'anual',
        1_744_000_000
      )
    ).rejects.toThrow('Não é possível fazer downgrade de plano');

    expect(stripeClient.prices.list).not.toHaveBeenCalled();
    expect(stripeClient.subscriptions.update).not.toHaveBeenCalled();
  });

  it('deve aplicar prorrateio e realinhar cobrança ao trocar o ciclo em uma assinatura ativa', async () => {
    (userModel.findById as jest.Mock)
      .mockReturnValueOnce(
        createChainableQueryResult(
          createUserRecord({
            stripeSubscriptionId: 'sub-ativa',
            plano: {
              titulo: 'Controle',
              slug: 'controle',
              valor: 19.9,
              ciclo: 'mensal',
              dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
              dataVencimento: new Date('2026-05-01T00:00:00.000Z'),
            },
          })
        )
      )
      .mockReturnValueOnce(
        createChainableQueryResult(
          createUserRecord({
            stripeSubscriptionId: 'sub-ativa',
            plano: {
              titulo: 'Controle',
              slug: 'controle',
              valor: 19.9,
              ciclo: 'mensal',
              dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
              dataVencimento: new Date('2026-05-01T00:00:00.000Z'),
            },
          })
        )
      );

    const activeSubscription = {
      id: 'sub-ativa',
      status: 'active',
      trial_end: null,
      metadata: {
        planId: 'controle',
        cycle: 'mensal',
      },
      customer: 'cus-ativa',
      items: {
        data: [
          {
            id: 'si-ativa',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 1990,
              metadata: {
                planId: 'controle',
                cycle: 'mensal',
              },
            },
          },
        ],
      },
    } as unknown as Stripe.Subscription;

    const refreshedSubscription = {
      ...activeSubscription,
      metadata: {
        planId: 'automacao',
        cycle: 'anual',
      },
      items: {
        data: [
          {
            id: 'si-ativa',
            current_period_start: 1_744_800_000,
            current_period_end: 1_776_336_000,
            price: {
              unit_amount: 2990,
              metadata: {
                planId: 'automacao',
                cycle: 'anual',
              },
            },
          },
        ],
      },
    } as unknown as Stripe.Subscription;

    stripeClient.subscriptions.retrieve
      .mockResolvedValueOnce(activeSubscription)
      .mockResolvedValueOnce(refreshedSubscription);
    stripeClient.products.list.mockResolvedValue({ data: [] });
    stripeClient.products.create.mockResolvedValue({ id: 'prod-automacao' });
    stripeClient.prices.list.mockResolvedValue({ data: [] });
    stripeClient.prices.create.mockResolvedValue({
      id: 'price-automacao-anual',
    });
    stripeClient.invoices.createPreview.mockResolvedValue({
      total: 430,
      lines: {
        data: [
          {
            amount: -850,
            parent: {
              subscription_item_details: {
                proration: true,
              },
            },
          },
          {
            amount: 1280,
            parent: {
              subscription_item_details: {
                proration: true,
              },
            },
          },
        ],
      },
    });
    stripeClient.subscriptions.update.mockResolvedValue({
      id: 'sub-ativa',
    });
    (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          _id: 'user-1',
          email: 'cliente@exemplo.com',
          nome: 'Cliente Exemplo',
          plano: {
            titulo: 'Automação',
            slug: 'automacao',
            valor: 29.9,
            ciclo: 'anual',
            dataAdmissao: new Date('2026-04-21T00:00:00.000Z'),
            dataVencimento: new Date('2027-04-21T00:00:00.000Z'),
          },
        })
      )
    );

    const result = await checkoutService.upgradeSubscription(
      'user-1',
      'automacao',
      'anual',
      1_744_000_000
    );

    expect(stripeClient.subscriptions.update).toHaveBeenCalledWith(
      'sub-ativa',
      expect.objectContaining({
        proration_behavior: 'create_prorations',
        billing_cycle_anchor: 'now',
        metadata: expect.objectContaining({
          planId: 'automacao',
          cycle: 'anual',
          userId: 'user-1',
        }),
      })
    );
    expect(result.plano?.slug).toBe('automacao');
    expect(result.plano?.ciclo).toBe('anual');
    expect(result.plano?.valor).toBe(29.9);
    expect(emailService.sendPlanUpgradeConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: 'cliente@exemplo.com',
        currentPlanName: 'Controle',
        nextPlanName: 'Automação',
      })
    );
  });

  it('deve criar uma sessão de checkout para cobrar a diferença do upgrade', async () => {
    (userModel.findById as jest.Mock).mockReturnValue(
      createChainableQueryResult(
        createUserRecord({
          stripeSubscriptionId: 'sub-ativa',
          email: 'cliente@exemplo.com',
          nome: 'Cliente Exemplo',
          plano: {
            titulo: 'Controle',
            slug: 'controle',
            valor: 19.9,
            ciclo: 'mensal',
            dataAdmissao: new Date('2026-04-01T00:00:00.000Z'),
            dataVencimento: new Date('2026-05-01T00:00:00.000Z'),
          },
        })
      )
    );

    stripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub-ativa',
      status: 'active',
      trial_end: null,
      metadata: {
        planId: 'controle',
        cycle: 'mensal',
      },
      customer: 'cus-ativa',
      items: {
        data: [
          {
            id: 'si-ativa',
            current_period_start: 1_744_000_000,
            current_period_end: 1_744_800_000,
            price: {
              unit_amount: 1990,
              metadata: {
                planId: 'controle',
                cycle: 'mensal',
              },
            },
          },
        ],
      },
    } as unknown as Stripe.Subscription);
    stripeClient.products.list.mockResolvedValue({ data: [] });
    stripeClient.products.create.mockResolvedValue({ id: 'prod-automacao' });
    stripeClient.prices.list.mockResolvedValue({ data: [] });
    stripeClient.prices.create.mockResolvedValue({
      id: 'price-automacao-anual',
    });
    stripeClient.invoices.createPreview.mockResolvedValue({
      total: 430,
      lines: {
        data: [
          {
            amount: -850,
            parent: {
              subscription_item_details: {
                proration: true,
              },
            },
          },
          {
            amount: 1280,
            parent: {
              subscription_item_details: {
                proration: true,
              },
            },
          },
        ],
      },
    } as unknown as Stripe.Invoice);
    stripeClient.checkout.sessions.create.mockResolvedValue({
      id: 'cs_upgrade_checkout',
      url: 'https://checkout.stripe.test/session',
    });

    const result = await checkoutService.createUpgradeCheckoutSession(
      'user-1',
      'automacao',
      'anual',
      1_744_000_000
    );

    expect(stripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        client_reference_id: 'user-1',
        customer_email: 'cliente@exemplo.com',
        success_url:
          'http://localhost:4200/app/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:4200/app/planos',
        metadata: expect.objectContaining({
          action: 'plan_upgrade',
          planId: 'automacao',
          cycle: 'anual',
          userId: 'user-1',
          prorationDate: '1744000000',
        }),
      })
    );
    expect(result).toEqual({
      url: 'https://checkout.stripe.test/session',
      sessionId: 'cs_upgrade_checkout',
    });
  });
});
