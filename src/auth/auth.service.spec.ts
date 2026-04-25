import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleProfile } from './google.strategy';

describe('AuthService', () => {
  const jwtService = {
    sign: jest.fn(() => 'signed-token'),
  };

  const buildService = (
    modelOverrides?: Partial<Record<string, jest.Mock>>
  ) => {
    const userModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      ...modelOverrides,
    };
    const service = new AuthService(userModel as never, jwtService as never);
    return { service, userModel };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('vincula googleId em conta existente por email', async () => {
    const existingUser = {
      _id: 'user-id',
      email: 'bruno@empresa.com',
      nome: 'Bruno',
      plano: null,
      password: 'hashed-password',
      googleId: undefined,
      emailVerified: false,
      avatarUrl: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const { service, userModel } = buildService();
    userModel.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUser);

    const profile: GoogleProfile = {
      googleId: 'google-id',
      email: 'Bruno@Empresa.com',
      emailVerified: true,
      nome: 'Bruno Empresa',
      avatarUrl: 'https://avatar/url',
    };

    const response = await service.loginOrRegisterWithGoogle(profile);

    expect(userModel.findOne).toHaveBeenNthCalledWith(1, {
      googleId: 'google-id',
    });
    expect(userModel.findOne).toHaveBeenNthCalledWith(2, {
      email: 'bruno@empresa.com',
    });
    expect(existingUser.googleId).toBe('google-id');
    expect(existingUser.emailVerified).toBe(true);
    expect(existingUser.avatarUrl).toBe('https://avatar/url');
    expect(existingUser.save).toHaveBeenCalledTimes(1);
    expect(response.access_token).toBe('signed-token');
  });

  it('cria novo usuario quando email nao existe', async () => {
    const createdUser = {
      _id: 'created-id',
      email: 'novo@empresa.com',
      nome: 'Novo Usuario',
      plano: null,
      password: 'hashed-password',
    };
    const { service, userModel } = buildService();
    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue(createdUser);

    const profile: GoogleProfile = {
      googleId: 'google-new-id',
      email: 'novo@empresa.com',
      emailVerified: true,
      nome: 'Novo Usuario',
      avatarUrl: null,
    };

    const response = await service.loginOrRegisterWithGoogle(profile);

    expect(userModel.create).toHaveBeenCalledTimes(1);
    expect(userModel.create.mock.calls[0][0].email).toBe('novo@empresa.com');
    expect(userModel.create.mock.calls[0][0].googleId).toBe('google-new-id');
    expect(response.access_token).toBe('signed-token');
  });

  it('bloqueia oauth sem email verificado', async () => {
    const { service } = buildService();
    const profile: GoogleProfile = {
      googleId: 'google-no-verified',
      email: 'usuario@empresa.com',
      emailVerified: false,
      nome: 'Usuario',
      avatarUrl: null,
    };

    await expect(service.loginOrRegisterWithGoogle(profile)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
