import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
    Simulacao,
    SimulacaoSchema,
} from '../simulate/schemas/simulacao.schema';
import { UserModule } from '../user/user.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Simulacao.name,
                schema: SimulacaoSchema,
            },
        ]),
        UserModule,
        AuthModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}

