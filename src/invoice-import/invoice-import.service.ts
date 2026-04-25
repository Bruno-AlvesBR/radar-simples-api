import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InvoiceRecord,
  InvoiceRecordDocument,
} from './schemas/invoice-record.schema';
import { parseInvoiceRecords } from './invoice-import.helper';
import { isPlanAtLeast } from '../plans/plan.constants';
import { UserService } from '../user/user.service';

export interface ImportedInvoiceSummary {
  importedRecords: number;
  totalAmount: number;
  monthlyTotals: Array<{
    competenceMonth: string;
    amount: number;
  }>;
}

@Injectable()
export class InvoiceImportService {
  constructor(
    @InjectModel(InvoiceRecord.name)
    private readonly invoiceRecordModel: Model<InvoiceRecordDocument>,
    private readonly userService: UserService
  ) {}

  async importFile(
    userId: string,
    fileBuffer: Buffer,
    fileName?: string
  ): Promise<ImportedInvoiceSummary> {
    try {
      const user = await this.userService.findById(userId);
      if (!isPlanAtLeast(user?.plano?.slug, 'automacao')) {
        throw new ForbiddenException(
          'Importação de notas disponível no Automação. Assine em Planos.'
        );
      }

      const parsedRecords = parseInvoiceRecords(fileBuffer, fileName);
      if (parsedRecords.length === 0) {
        throw new BadRequestException(
          'Não foi possível identificar notas válidas na planilha.'
        );
      }

      const persistedRecords = await this.invoiceRecordModel.insertMany(
        parsedRecords.map((record) => ({
          userId,
          issueDate: record.issueDate,
          amount: record.amount,
          competenceMonth: record.competenceMonth,
          sourceFileName: fileName,
        }))
      );

      return this.buildSummary(persistedRecords);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao processar o arquivo importado.';
      throw new BadRequestException(message);
    }
  }

  async getMonthlySummary(userId: string): Promise<ImportedInvoiceSummary> {
    const user = await this.userService.findById(userId);
    if (!isPlanAtLeast(user?.plano?.slug, 'automacao')) {
      throw new ForbiddenException(
        'Importação de notas disponível no Automação. Assine em Planos.'
      );
    }

    const records = await this.invoiceRecordModel
      .find({ userId })
      .sort({ issueDate: -1 })
      .lean();

    return this.buildSummary(records);
  }

  private buildSummary(
    records: Array<{
      competenceMonth: string;
      amount: number;
    }>
  ): ImportedInvoiceSummary {
    const monthlyMap = new Map<string, number>();
    let totalAmount = 0;

    for (const record of records) {
      totalAmount += record.amount;
      monthlyMap.set(
        record.competenceMonth,
        (monthlyMap.get(record.competenceMonth) ?? 0) + record.amount
      );
    }

    return {
      importedRecords: records.length,
      totalAmount,
      monthlyTotals: Array.from(monthlyMap.entries())
        .map(([competenceMonth, amount]) => ({
          competenceMonth,
          amount,
        }))
        .sort((firstItem, secondItem) =>
          secondItem.competenceMonth.localeCompare(firstItem.competenceMonth)
        ),
    };
  }
}
