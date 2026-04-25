import { Response } from 'express';
import { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let authenticationController: AuthController;
    let authenticationService: {
        register: jest.Mock;
        login: jest.Mock;
    };
    let authenticationCookieService: {
        setAuthenticationCookie: jest.Mock;
        clearAuthenticationCookie: jest.Mock;
    };

    beforeEach(() => {
        authenticationService = {
            register: jest.fn(),
            login: jest.fn(),
        };
        authenticationCookieService = {
            setAuthenticationCookie: jest.fn(),
            clearAuthenticationCookie: jest.fn(),
        };
        authenticationController = new AuthController(
            authenticationService as unknown as AuthService,
            authenticationCookieService as unknown as AuthCookieService
        );
    });

    it('deve delegar o registro ao serviço e definir o cookie de autenticação', async () => {
        const response = { cookie: jest.fn() } as unknown as Response;
        const authenticationPayload = {
            access_token: 'token-registro',
            user: { id: '1', email: 'a@b.com', nome: 'A', plano: null },
        };
        authenticationService.register.mockResolvedValue(authenticationPayload);

        const result = await authenticationController.register(
            { email: 'a@b.com', password: 'x', nome: 'A' } as never,
            response
        );

        expect(authenticationService.register).toHaveBeenCalled();
        expect(authenticationCookieService.setAuthenticationCookie).toHaveBeenCalledWith(
            response,
            'token-registro'
        );
        expect(result).toEqual(authenticationPayload);
    });

    it('deve delegar o login ao serviço e definir o cookie de autenticação', async () => {
        const response = { cookie: jest.fn() } as unknown as Response;
        const authenticationPayload = {
            access_token: 'token-login',
            user: { id: '2', email: 'b@b.com', nome: 'B', plano: null },
        };
        authenticationService.login.mockResolvedValue(authenticationPayload);

        const result = await authenticationController.login(
            { email: 'b@b.com', password: 'y' } as never,
            response
        );

        expect(authenticationService.login).toHaveBeenCalled();
        expect(authenticationCookieService.setAuthenticationCookie).toHaveBeenCalledWith(
            response,
            'token-login'
        );
        expect(result).toEqual(authenticationPayload);
    });

    it('deve limpar o cookie ao fazer logout', () => {
        const response = { clearCookie: jest.fn() } as unknown as Response;

        const result = authenticationController.logout(response);

        expect(authenticationCookieService.clearAuthenticationCookie).toHaveBeenCalledWith(
            response
        );
        expect(result).toEqual({ success: true });
    });
});
