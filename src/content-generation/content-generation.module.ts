import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogModule } from '../blog/blog.module';
import { KeywordResearchModule } from '../keyword-research/keyword-research.module';
import { ContentGenerationController } from './content-generation.controller';
import { ContentGenerationService } from './content-generation.service';
import { BrandVoice, BrandVoiceSchema } from './schemas/brand-voice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrandVoice.name, schema: BrandVoiceSchema },
    ]),
    BlogModule,
    KeywordResearchModule,
  ],
  controllers: [ContentGenerationController],
  providers: [ContentGenerationService],
  exports: [ContentGenerationService],
})
export class ContentGenerationModule {}
