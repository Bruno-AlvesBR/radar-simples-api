import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogService } from '../blog/blog.service';
import { KeywordResearchService } from '../keyword-research/keyword-research.service';
import { BrandVoice, BrandVoiceDocument } from './schemas/brand-voice.schema';

@Injectable()
export class ContentGenerationService {
  constructor(
    @InjectModel(BrandVoice.name)
    private readonly brandVoiceModel: Model<BrandVoiceDocument>,
    private readonly blogService: BlogService,
    private readonly keywordResearchService: KeywordResearchService
  ) {}

  async ensureDefaultBrandVoiceProfile() {
    const existingProfile = await this.brandVoiceModel.findOne({
      profileIdentifier: 'default',
    });
    if (existingProfile) {
      return existingProfile.toObject();
    }
    const createdProfile = await this.brandVoiceModel.create({
      profileIdentifier: 'default',
      toneOfVoice: 'profissional-acessivel',
      targetAudience: 'PJs e microempresas no Simples Nacional',
      preferredTerms: ['planejamento tributario', 'economia fiscal'],
      forbiddenTerms: ['achismo', 'promessa garantida'],
      writingStyle: 'claro, objetivo e orientado por dados',
    });
    return createdProfile.toObject();
  }

  async generateDraftArticleFromBestKeyword() {
    const keyword = await this.pickBestAvailableKeyword();
    if (!keyword) {
      return {
        success: false,
        reason: 'Nenhuma keyword disponível para geração de artigo',
      };
    }

    const brandVoice = await this.ensureDefaultBrandVoiceProfile();
    const generatedDraft = await this.blogService.createArticle({
      slug: this.generateSlug(keyword.keyword),
      title: this.generateTitle(keyword.keyword),
      description: this.generateDescription(keyword.keyword),
      focusKeyword: keyword.keyword,
      keywords: [keyword.keyword, 'simples nacional', 'fator r'],
      summaryParagraphs: [
        `Este conteúdo explica ${keyword.keyword} de forma prática para pequenas empresas.`,
        `As orientações foram estruturadas com foco em decisão tributária mais segura.`,
      ],
      contentSections: [
        {
          type: 'h2',
          contentAsText: `O que significa ${keyword.keyword}`,
        },
        {
          type: 'p',
          contentAsText: `No contexto do Simples Nacional, ${keyword.keyword} impacta diretamente o planejamento tributário mensal.`,
        },
        {
          type: 'h2',
          contentAsText: 'Como aplicar no dia a dia da empresa',
        },
        {
          type: 'ul',
          contentAsList: [
            'Conferir faturamento dos últimos 12 meses',
            'Validar enquadramento no anexo correto',
            'Simular impacto no valor do DAS antes do fechamento',
          ],
        },
        {
          type: 'ref',
          contentAsText:
            'Considere validar os cálculos com contador antes da tomada de decisão.',
        },
      ],
      references: [
        {
          label: 'Receita Federal - Simples Nacional',
          url: 'https://www8.receita.fazenda.gov.br/simplesnacional/',
        },
      ],
      status: 'scheduled',
      scheduledPublishDate: new Date().toISOString(),
      seoScore: 86,
      wordCount: 1200,
      readingTimeMinutes: 8,
      generatedByArtificialIntelligence: false,
      sourceKeywordId: String(keyword._id ?? ''),
    });

    await this.keywordResearchService.markKeywordAsUsed(keyword.keyword);

    return {
      success: true,
      brandVoice,
      article: generatedDraft,
    };
  }

  private generateSlug(keyword: string) {
    return keyword
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private generateTitle(keyword: string) {
    return `${keyword} para PJs: guia prático para economizar impostos`;
  }

  private generateDescription(keyword: string) {
    return `Aprenda como aplicar ${keyword} no Simples Nacional com uma abordagem prática e orientada por dados.`;
  }

  private async pickBestAvailableKeyword() {
    const maximumAttempts = 50;
    let attempts = 0;

    while (attempts < maximumAttempts) {
      const keyword =
        await this.keywordResearchService.pickBestKeywordForNextArticle();
      if (!keyword) {
        return null;
      }

      const generatedSlug = this.generateSlug(keyword.keyword);
      const existingArticle = await this.blogService.findArticleBySlug(
        generatedSlug
      );

      if (!existingArticle) {
        return keyword;
      }

      await this.keywordResearchService.markKeywordAsUsed(keyword.keyword);
      attempts += 1;
    }

    return null;
  }
}
