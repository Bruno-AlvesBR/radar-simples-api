import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KeywordResearchController } from './keyword-research.controller';
import { KeywordResearchService } from './keyword-research.service';
import {
  KeywordOpportunity,
  KeywordOpportunitySchema,
} from './schemas/keyword-opportunity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KeywordOpportunity.name, schema: KeywordOpportunitySchema },
    ]),
  ],
  controllers: [KeywordResearchController],
  providers: [KeywordResearchService],
  exports: [KeywordResearchService],
})
export class KeywordResearchModule {}
