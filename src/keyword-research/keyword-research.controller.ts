import { Controller, Get, Post } from '@nestjs/common';
import { KeywordResearchService } from './keyword-research.service';

@Controller('keyword-research')
export class KeywordResearchController {
  constructor(
    private readonly keywordResearchService: KeywordResearchService
  ) {}

  @Get()
  listKeywordOpportunities() {
    return this.keywordResearchService.listKeywordOpportunities();
  }

  @Post('collect')
  collectKeywordOpportunities() {
    return this.keywordResearchService.collectKeywordOpportunities();
  }

  @Get('best-next')
  pickBestKeywordForNextArticle() {
    return this.keywordResearchService.pickBestKeywordForNextArticle();
  }
}
