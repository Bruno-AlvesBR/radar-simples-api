import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoiceImportService } from './invoice-import.service';

@Controller('invoice-import')
@UseGuards(JwtAuthGuard)
export class InvoiceImportController {
  constructor(private readonly invoiceImportService: InvoiceImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: { sub: string },
    @UploadedFile() file?: { buffer: Buffer; originalname: string }
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    return this.invoiceImportService.importFile(
      user.sub,
      file.buffer,
      file.originalname
    );
  }

  @Get('summary')
  summary(@CurrentUser() user: { sub: string }) {
    return this.invoiceImportService.getMonthlySummary(user.sub);
  }
}
