import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { GoogleProfile } from './google.strategy';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let authenticationService: AuthService;
    let userModel: {
        findOne: jest.Mock;
        create: jest.Mock;
    };
    let jwtService: { sign: jest.Mock };
    let emailService: { sendUserRegistrationWelcome: jest.Mock };
    let configurationService: { get: jest.Mock };
    let referralService: { recordReferralFromRegistration: jest.Mock };

    beforeEach(() => {
        userModel = {
            findOne: jest.fn(),
            create: jest.fn(),
        };
        jwtService = {
            sign: jest.fn().mockReturnValue('signed-jwt-token'),
        };
        emailService = {
            sendUserRegistrationWelcome: jest.fn().mockResolvedValue(undefined),
        };
        configurationService = {
            get: jest.fn((_key: string, defaultValue?: string) => defaultValue),
        };
        referralService = {
            recordReferralFromRegistration: jest.fn().mockResolvedValue(undefined),
        };
        authenticationService = new AuthService(
            userModel as never,
            jwtService as never,
            emailService as never,
            configurationService as never,
            referralService as never
        );
        (bcrypt.hash as jest.Mock).mockReset();
        (bcrypt.compare as jest.Mock).mockReset();
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

        const response = await authenticationService.loginOrRegisterWithGoogle(
            profile
        );

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
        expect(response.access_token).toBe('signed-jwt-token');
    });

    it('cria novo usuario quando email nao existe', async () => {
        const createdUser = {
            _id: 'created-id',
            email: 'novo@empresa.com',
            nome: 'Novo Usuario',
            plano: null,
            password: 'hashed-password',
        };
        userModel.findOne.mockResolvedValue(null);
        userModel.create.mockResolvedValue(createdUser);

        const profile: GoogleProfile = {
            googleId: 'google-new-id',
            email: 'novo@empresa.com',
            emailVerified: true,
            nome: 'Novo Usuario',
            avatarUrl: null,
        };

        const response = await authenticationService.loginOrRegisterWithGoogle(
            profile
        );

        expect(userModel.create).toHaveBeenCalledTimes(1);
        expect(userModel.create.mock.calls[0][0].email).toBe('novo@empresa.com');
        expect(userModel.create.mock.calls[0][0].googleId).toBe('google-new-id');
        expect(response.access_token).toBe('signed-jwt-token');
    });

    it('bloqueia oauth sem email verificado', async () => {
        const profile: GoogleProfile = {
            googleId: 'google-no-verified',
            email: 'usuario@empresa.com',
            emailVerified: false,
            nome: 'Usuario',
            avatarUrl: null,
        };

        await expect(
            authenticationService.loginOrRegisterWithGoogle(profile)
        ).rejects.toThrow(UnauthorizedException);
    });

    it('deve registrar um novo usuário e retornar token com usuário sem plano', async () => {
        userModel.findOne.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('password-hash');
        const createdUser = {
            _id: 'user-new-id',
            email: 'novo@exemplo.com',
            nome: 'Novo Usuario',
            password: 'password-hash',
        };
        userModel.create.mockResolvedValue(createdUser);

        const result = await authenticationService.register({
            email: 'novo@exemplo.com',
            password: 'secret123',
            nome: 'Novo Usuario',
        });

        expect(result.access_token).toBe('signed-jwt-token');
        expect(result.user).toEqual(
            expect.objectContaining({
                email: 'novo@exemplo.com',
                nome: 'Novo Usuario',
                plano: null,
            })
        );
        expect(jwtService.sign).toHaveBeenCalledWith({
            sub: 'user-new-id',
            email: 'novo@exemplo.com',
        });
        expect(emailService.sendUserRegistrationWelcome).toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando o email já está cadastrado', async () => {
        userModel.findOne.mockResolvedValue({ email: 'existente@exemplo.com' });

        await expect(
            authenticationService.register({
                email: 'existente@exemplo.com',
                password: 'secret',
                nome: 'Existente',
            })
        ).rejects.toThrow(UnauthorizedException);
        await expect(
            authenticationService.register({
                email: 'existente@exemplo.com',
                password: 'secret',
                nome: 'Existente',
            })
        ).rejects.toThrow('Email já cadastrado');
        expect(userModel.create).not.toHaveBeenCalled();
    });

    it('deve autenticar com credenciais válidas e retornar token', async () => {
        const storedUser = {
            _id: 'user-login',
            email: 'login@exemplo.com',
            nome: 'Login User',
            password: 'stored-hash',
            plano: null,
        };
        userModel.findOne.mockResolvedValue(storedUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await authenticationService.login({
            email: 'login@exemplo.com',
            password: 'correct',
        });

        expect(result.access_token).toBe('signed-jwt-token');
        expect(bcrypt.compare).toHaveBeenCalledWith('correct', 'stored-hash');
    });

    it('deve lançar UnauthorizedException quando a senha está incorreta', async () => {
        userModel.findOne.mockResolvedValue({
            _id: 'u1',
            email: 'a@b.com',
            password: 'hash',
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
            authenticationService.login({ email: 'a@b.com', password: 'wrong' })
        ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o email não existe', async () => {
        userModel.findOne.mockResolvedValue(null);

        await expect(
            authenticationService.login({
                email: 'inexistente@exemplo.com',
                password: 'any',
            })
        ).rejects.toThrow(UnauthorizedException);
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve normalizar o slug legado pro no token ao fazer login', async () => {
        userModel.findOne.mockResolvedValue({
            _id: 'user-pro',
            email: 'pro@exemplo.com',
            nome: 'Pro User',
            password: 'hash',
            plano: {
                titulo: 'Antigo',
                slug: 'pro',
                valor: 9.9,
                ciclo: 'mensal',
                dataAdmissao: new Date('2026-01-01'),
                dataVencimento: new Date('2026-02-01'),
            },
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await authenticationService.login({
            email: 'pro@exemplo.com',
            password: 'ok',
        });

        expect(result.user.plano?.slug).toBe('essencial');
        expect(result.user.plano?.titulo).toBe('Essencial');
    });

    it('deve incluir plano controle normalizado no token', async () => {
        userModel.findOne.mockResolvedValue({
            _id: 'user-controle',
            email: 'c@exemplo.com',
            nome: 'C',
            password: 'hash',
            plano: {
                titulo: 'Controle',
                slug: 'controle',
                valor: 19.9,
                ciclo: 'mensal',
                dataAdmissao: new Date(),
                dataVencimento: new Date(),
            },
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await authenticationService.login({
            email: 'c@exemplo.com',
            password: 'ok',
        });

        expect(result.user.plano?.slug).toBe('controle');
    });

    it('deve concluir o registro mesmo quando o email de boas-vindas falha', async () => {
        userModel.findOne.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
        userModel.create.mockResolvedValue({
            _id: 'id-welcome-fail',
            email: 'welcome@exemplo.com',
            nome: 'W',
        });
        emailService.sendUserRegistrationWelcome.mockRejectedValue(
            new Error('smtp down')
        );

        const result = await authenticationService.register({
            email: 'welcome@exemplo.com',
            password: 'p',
            nome: 'W',
        });

        expect(result.access_token).toBe('signed-jwt-token');
    });
});
