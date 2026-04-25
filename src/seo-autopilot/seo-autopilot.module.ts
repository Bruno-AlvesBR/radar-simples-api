import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { ContentGenerationModule } from '../content-generation/content-generation.module';
import { KeywordResearchModule } from '../keyword-research/keyword-research.module';
import { SeoAutopilotService } from './seo-autopilot.service';

@Module({
  imports: [BlogModule, ContentGenerationModule, KeywordResearchModule],
  providers: [SeoAutopilotService],
})
export class SeoAutopilotModule {}
