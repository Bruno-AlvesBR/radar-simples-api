import { ReferralService } from './referral.service';

describe('ReferralService', () => {
  let referralService: ReferralService;
  let referralCodeModel: { findOne: jest.Mock; create: jest.Mock };
  let referralModel: {
    countDocuments: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    updateMany: jest.Mock;
  };

  beforeEach(() => {
    referralCodeModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    referralModel = {
      countDocuments: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      updateMany: jest.fn(),
    };
    referralModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    referralService = new ReferralService(
      referralCodeModel as never,
      referralModel as never
    );
  });

  it('deve retornar código existente quando já cadastrado', async () => {
    referralCodeModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ code: 'ABC12345' }),
    });

    const code = await referralService.getOrCreateReferralCodeForUser('user-1');

    expect(code).toBe('ABC12345');
    expect(referralCodeModel.create).not.toHaveBeenCalled();
  });

  it('deve criar código quando ainda não existe', async () => {
    referralCodeModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    referralCodeModel.create.mockResolvedValue({});

    const code = await referralService.getOrCreateReferralCodeForUser('user-2');

    expect(code.length).toBeGreaterThanOrEqual(8);
    expect(referralCodeModel.create).toHaveBeenCalled();
  });

  it('deve retornar estatísticas agregadas', async () => {
    referralModel.countDocuments
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const stats = await referralService.getReferralStatsForUser('ref-user');

    expect(stats).toEqual({
      pendingReferrals: 1,
      convertedReferrals: 2,
    });
  });

  it('deve registrar indicação pendente quando o cadastro usa código de outro usuário', async () => {
    referralCodeModel.findOne.mockResolvedValue({
      userId: 'referrer-user-id',
      code: 'VALIDCODE1',
    });
    referralModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    referralModel.create.mockResolvedValue({});

    await referralService.recordReferralFromRegistration(
      'validcode1',
      'referred-user-id',
      'Nova@Email.com'
    );

    expect(referralModel.create).toHaveBeenCalledWith({
      referrerUserId: 'referrer-user-id',
      referredUserId: 'referred-user-id',
      referredEmail: 'nova@email.com',
      status: 'pending',
      rewardApplied: false,
    });
  });

  it('deve ignorar novo vínculo de indicação quando o indicado já possui registro', async () => {
    referralCodeModel.findOne.mockResolvedValue({
      userId: 'referrer-user-id',
      code: 'VALIDCODE1',
    });
    referralModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'existing' }),
    });

    await referralService.recordReferralFromRegistration(
      'validcode1',
      'referred-user-id',
      'nova@email.com'
    );

    expect(referralModel.create).not.toHaveBeenCalled();
  });

  it('deve marcar indicações pendentes como convertidas quando o indicado assina plano', async () => {
    referralModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

    await referralService.recordReferralConversionWhenReferredUserSubscribesToPlan(
      'referred-user-id'
    );

    expect(referralModel.updateMany).toHaveBeenCalledWith(
      { referredUserId: 'referred-user-id', status: 'pending' },
      { $set: { status: 'converted' } }
    );
  });
});
