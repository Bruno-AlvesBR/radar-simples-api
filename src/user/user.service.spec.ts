import { UserService } from './user.service';

function createFindByIdChain(userDocument: Record<string, unknown> | null) {
    return {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(userDocument),
    };
}

function createFindByIdAndUpdateChain(updatedDocument: Record<string, unknown>) {
    return {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(updatedDocument),
    };
}

describe('UserService', () => {
    let userService: UserService;
    let userModel: {
        findById: jest.Mock;
        findByIdAndUpdate: jest.Mock;
        find: jest.Mock;
    };
    let simulacaoModel: {
        countDocuments: jest.Mock;
        findOne: jest.Mock;
    };
    let fiscalReminderService: {
        getDashboardSummary: jest.Mock;
    };

    beforeEach(() => {
        userModel = {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            find: jest.fn(),
        };
        simulacaoModel = {
            countDocuments: jest.fn(),
            findOne: jest.fn(),
        };
        fiscalReminderService = {
            getDashboardSummary: jest.fn().mockResolvedValue({
                accessAllowed: false,
                planSlug: null,
                diasAntecedenciaPermitidos: [7],
                diasAntecedenciaSelecionados: [7],
                obrigacoesProximas: [
                    {
                        kind: 'das',
                        name: 'DAS',
                        dueDate: new Date('2026-05-20'),
                        daysRemaining: 20,
                    },
                ],
            }),
        };
        userService = new UserService(
            userModel as never,
            simulacaoModel as never,
            fiscalReminderService as never
        );
    });

    it('deve retornar null quando o usuário não existe', async () => {
        userModel.findById.mockReturnValue(createFindByIdChain(null));

        const result = await userService.findById('id-inexistente');

        expect(result).toBeNull();
    });

    it('deve retornar usuário com plano normalizado quando possui plano', async () => {
        userModel.findById.mockReturnValue(
            createFindByIdChain({
                _id: 'user-1',
                email: 'u@exemplo.com',
                nome: 'Usuario',
                empresa: { cnpj: '123' },
                plano: {
                    titulo: 'Controle',
                    slug: 'controle',
                    valor: 19.9,
                    ciclo: 'mensal',
                    dataAdmissao: new Date('2026-01-01'),
                    dataVencimento: new Date('2026-02-01'),
                },
            })
        );

        const result = await userService.findById('user-1');

        expect(result).toEqual(
            expect.objectContaining({
                id: 'user-1',
                email: 'u@exemplo.com',
                nome: 'Usuario',
                empresa: { cnpj: '123' },
                plano: expect.objectContaining({
                    slug: 'controle',
                    titulo: 'Controle',
                }),
            })
        );
    });

    it('deve retornar usuário sem plano quando plano ausente', async () => {
        userModel.findById.mockReturnValue(
            createFindByIdChain({
                _id: 'user-2',
                email: 'sem@exemplo.com',
                nome: 'Sem Plano',
            })
        );

        const result = await userService.findById('user-2');

        expect(result?.plano).toBeNull();
    });

    it('deve normalizar slug legado pro para essencial', async () => {
        userModel.findById.mockReturnValue(
            createFindByIdChain({
                _id: 'user-3',
                email: 'legado@exemplo.com',
                nome: 'Legado',
                plano: {
                    titulo: 'Antigo',
                    slug: 'pro',
                    valor: 9.9,
                    ciclo: 'mensal',
                    dataAdmissao: new Date(),
                    dataVencimento: new Date(),
                },
            })
        );

        const result = await userService.findById('user-3');

        expect(result?.plano?.slug).toBe('essencial');
        expect(result?.plano?.titulo).toBe('Essencial');
    });

    it('deve persistir empresa e retornar documento atualizado', async () => {
        const updated = {
            _id: 'user-4',
            email: 'e@exemplo.com',
            nome: 'E',
            empresa: { razaoSocial: 'PJ Teste' },
        };
        userModel.findByIdAndUpdate.mockReturnValue(
            createFindByIdAndUpdateChain(updated)
        );

        const result = await userService.salvarEmpresa('user-4', {
            razaoSocial: 'PJ Teste',
        });

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'user-4',
            { empresa: { razaoSocial: 'PJ Teste' } },
            { new: true }
        );
        expect(result).toEqual(updated);
    });

    it('deve retornar status de onboarding coerente', async () => {
        userModel.findById.mockReturnValue(
            createFindByIdChain({
                _id: 'onb-1',
                email: 'o@exemplo.com',
                nome: 'O',
                empresa: { cnpj: '11.222.333/0001-81' },
                plano: {
                    titulo: 'Essencial',
                    slug: 'essencial',
                    valor: 9.9,
                    ciclo: 'mensal',
                    dataAdmissao: new Date(),
                    dataVencimento: new Date(),
                },
            })
        );
        simulacaoModel.countDocuments.mockResolvedValue(2);

        const status = await userService.getOnboardingStatus('onb-1');

        expect(status).toEqual({
            completedFirstSimulation: true,
            linkedCnpj: true,
            subscribedPlan: true,
        });
    });

    it('deve retornar resumo de fechamento mensal', async () => {
        const createdAt = new Date();
        userModel.findById.mockReturnValue(
            createFindByIdChain({
                _id: 'm1',
                email: 'm@exemplo.com',
                empresa: { simples: true, porte: 'ltda' },
            })
        );
        simulacaoModel.findOne.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    createdAt,
                    rbt12: 120000,
                    resultado: { dasEstimado: 450 },
                }),
            }),
        });

        const summary = await userService.getMonthlySummary('m1');

        expect(summary?.revenueUpdateSuggested).toBe(false);
        expect(summary?.lastSimulationInMonth?.dasEstimado).toBe(450);
        expect(summary?.fiscalObligationsPreview.length).toBeGreaterThan(0);
    });
});
