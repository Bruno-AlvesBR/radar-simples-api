import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SimulateController } from './simulate.controller';
import { SimulateService } from './simulate.service';
import { Simulacao, SimulacaoSchema } from './schemas/simulacao.schema';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Simulacao.name, schema: SimulacaoSchema },
    ]),
    UserModule,
    AuthModule,
  ],
  controllers: [SimulateController],
  providers: [SimulateService],
})
export class SimulateModule {}
