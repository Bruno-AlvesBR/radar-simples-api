import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { InvoiceImportController } from './invoice-import.controller';
import { InvoiceImportService } from './invoice-import.service';
import {
  InvoiceRecord,
  InvoiceRecordSchema,
} from './schemas/invoice-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InvoiceRecord.name,
        schema: InvoiceRecordSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [InvoiceImportController],
  providers: [InvoiceImportService],
  exports: [InvoiceImportService],
})
export class InvoiceImportModule {}
