import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  KeywordOpportunity,
  KeywordOpportunityDocument,
} from './schemas/keyword-opportunity.schema';

@Injectable()
export class KeywordResearchService {
  private readonly keywordSeeds = [
    'fator r',
    'simples nacional',
    'impostos pj',
    'anexo iii',
    'anexo v',
    'rbt12',
    'pro labore',
  ];

  private readonly professionSeeds = [
    'desenvolvedor',
    'advogado',
    'psicologo',
    'arquiteto',
    'consultor',
    'contador',
  ];

  constructor(
    @InjectModel(KeywordOpportunity.name)
    private readonly keywordOpportunityModel: Model<KeywordOpportunityDocument>
  ) {}

  async listKeywordOpportunities() {
    return this.keywordOpportunityModel
      .find({})
      .sort({ opportunityScore: -1, updatedAt: -1 })
      .lean();
  }

  async collectKeywordOpportunities() {
    const combinedSeeds = this.buildSeedCombinations();
    const opportunities = combinedSeeds.map((keyword) => {
      const normalizedKeyword = keyword.toLowerCase();
      const intent = this.resolveIntent(normalizedKeyword);
      const searchVolume = this.estimateSearchVolume(normalizedKeyword);
      const competitionDifficulty =
        this.estimateCompetitionDifficulty(normalizedKeyword);
      const intentScore = this.resolveIntentScore(intent);
      const opportunityScore = this.calculateOpportunityScore(
        searchVolume,
        intentScore,
        competitionDifficulty
      );

      return {
        keyword: normalizedKeyword,
        intent,
        searchVolume,
        competitionDifficulty,
        intentScore,
        opportunityScore,
        alreadyUsedForArticle: false,
      };
    });

    await Promise.all(
      opportunities.map((opportunity) =>
        this.keywordOpportunityModel.updateOne(
          { keyword: opportunity.keyword },
          { $set: opportunity },
          { upsert: true }
        )
      )
    );

    return this.listKeywordOpportunities();
  }

  async markKeywordAsUsed(keyword: string) {
    await this.keywordOpportunityModel.updateOne(
      { keyword: keyword.toLowerCase() },
      { $set: { alreadyUsedForArticle: true } }
    );
  }

  async pickBestKeywordForNextArticle() {
    return this.keywordOpportunityModel
      .findOne({ alreadyUsedForArticle: false })
      .sort({ opportunityScore: -1, updatedAt: -1 })
      .lean();
  }

  private buildSeedCombinations() {
    const year = new Date().getFullYear();
    const combinations = new Set<string>();
    for (const keywordSeed of this.keywordSeeds) {
      combinations.add(`${keywordSeed} ${year}`);
      combinations.add(`como calcular ${keywordSeed}`);
      for (const professionSeed of this.professionSeeds) {
        combinations.add(`${keywordSeed} para ${professionSeed}`);
        combinations.add(`${professionSeed} ${keywordSeed} ${year}`);
      }
    }
    return Array.from(combinations);
  }

  private resolveIntent(keyword: string) {
    if (keyword.includes('simulador') || keyword.includes('calcular')) {
      return 'transactional' as const;
    }
    if (keyword.includes('vs') || keyword.includes('diferença')) {
      return 'commercial' as const;
    }
    return 'informational' as const;
  }

  private resolveIntentScore(
    intent: 'informational' | 'commercial' | 'transactional'
  ) {
    if (intent === 'transactional') {
      return 3;
    }
    if (intent === 'commercial') {
      return 2;
    }
    return 1;
  }

  private estimateSearchVolume(keyword: string) {
    return 80 + Math.min(900, keyword.length * 12);
  }

  private estimateCompetitionDifficulty(keyword: string) {
    const baseDifficulty = keyword.includes('simples nacional') ? 70 : 45;
    return Math.min(95, baseDifficulty + (keyword.length % 20));
  }

  private calculateOpportunityScore(
    searchVolume: number,
    intentScore: number,
    competitionDifficulty: number
  ) {
    return Number(
      ((searchVolume * intentScore) / (competitionDifficulty + 1)).toFixed(2)
    );
  }
}
