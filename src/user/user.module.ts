import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { Simulacao, SimulacaoSchema } from '../simulate/schemas/simulacao.schema';
import { FiscalReminderModule } from '../fiscal-reminder/fiscal-reminder.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Simulacao.name, schema: SimulacaoSchema },
    ]),
    AuthModule,
    forwardRef(() => FiscalReminderModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
