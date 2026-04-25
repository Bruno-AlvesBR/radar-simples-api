import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  capturar(@Body() dto: CreateLeadDto) {
    return this.leadsService.capturar(dto);
  }

  @Get('stats')
  getLeadStatistics(@Headers('x-radar-admin-key') adminApiKey: string | undefined) {
    return this.leadsService.getLeadCaptureStatistics(adminApiKey);
  }
}
