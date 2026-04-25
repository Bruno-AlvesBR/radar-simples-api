import { Controller, Post } from '@nestjs/common';
import { ContentGenerationService } from './content-generation.service';

@Controller('content-generation')
export class ContentGenerationController {
  constructor(
    private readonly contentGenerationService: ContentGenerationService
  ) {}

  @Post('brand-voice/default')
  ensureDefaultBrandVoiceProfile() {
    return this.contentGenerationService.ensureDefaultBrandVoiceProfile();
  }

  @Post('draft/generate')
  generateDraftArticleFromBestKeyword() {
    return this.contentGenerationService.generateDraftArticleFromBestKeyword();
  }
}
