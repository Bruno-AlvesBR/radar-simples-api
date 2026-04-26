import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { SimulateDto } from './simulate.dto';

export class CompareSimulationScenarioDto extends SimulateDto {}

export class CompareSimulationsDto {
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(3)
    @ValidateNested({ each: true })
    @Type(() => CompareSimulationScenarioDto)
    scenarios: CompareSimulationScenarioDto[];
}

