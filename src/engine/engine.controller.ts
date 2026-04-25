import { Controller, Get } from '@nestjs/common';
import { engineRulesMetadata } from './engine-metadata.constants';

@Controller('engine')
export class EngineController {
    @Get('metadata')
    getEngineMetadata() {
        return engineRulesMetadata;
    }
}
