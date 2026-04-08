import { Body, Controller, Post } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  capturar(@Body() dto: CreateLeadDto) {
    return this.leadsService.capturar(dto);
  }
}
