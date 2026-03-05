import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { SimulateService } from "./simulate.service";
import { SimulateDto } from "./dto/simulate.dto";
import { ProjectionDto } from "./dto/projection.dto";

@Controller("simulate")
export class SimulateController {
  constructor(private readonly simulateService: SimulateService) {}

  @Post()
  simulate(@Body() dto: SimulateDto) {
    return this.simulateService.simulate(dto);
  }

  @Post("save")
  @UseGuards(JwtAuthGuard)
  simulateAndSave(@Body() dto: SimulateDto, @CurrentUser() user: { sub: string }) {
    return this.simulateService.simulateAndSave(dto, user.sub);
  }

  @Get("projection")
  @UseGuards(JwtAuthGuard)
  projection(@Query() dto: ProjectionDto, @CurrentUser() user: { sub: string }) {
    return this.simulateService.projection(dto, user.sub);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser() user: { sub: string }) {
    return this.simulateService.getHistory(user.sub);
  }
}
