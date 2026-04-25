import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
    let userController: UserController;
    let userService: { findById: jest.Mock; salvarEmpresa: jest.Mock };

    beforeEach(() => {
        userService = {
            findById: jest.fn(),
            salvarEmpresa: jest.fn(),
        };
        userController = new UserController(userService as unknown as UserService);
    });

    it('deve retornar o usuário atual em GET me', async () => {
        const userPayload = {
            id: 'sub-1',
            email: 'me@exemplo.com',
            nome: 'Me',
            plano: null,
        };
        userService.findById.mockResolvedValue(userPayload);

        const result = await userController.me({ sub: 'sub-1' });

        expect(userService.findById).toHaveBeenCalledWith('sub-1');
        expect(result).toEqual(userPayload);
    });

    it('deve delegar PUT empresa ao serviço', async () => {
        const empresaPayload = { cnpj: '11222333000181' };
        userService.salvarEmpresa.mockResolvedValue({ ok: true });

        const result = await userController.salvarEmpresa(
            { sub: 'user-x' },
            empresaPayload
        );

        expect(userService.salvarEmpresa).toHaveBeenCalledWith('user-x', empresaPayload);
        expect(result).toEqual({ ok: true });
    });
});
