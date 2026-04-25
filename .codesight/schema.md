# Schema

### Article
- label: string
- url: string
- content: string
- slug: string
- title: string
- description: string
- focusKeyword: string
- keywords: string[]
- summaryParagraphs: string[]
- contentSections: articlesection[]
- references: articlereference[]
- scheduledPublishDate: date
- publishedAt: date
- seoScore: number
- wordCount: number
- readingTimeMinutes: number
- generatedByArtificialIntelligence: boolean
- sourceKeywordId: string

### BrandVoice
- profileIdentifier: string
- toneOfVoice: string
- targetAudience: string
- preferredTerms: string[]
- forbiddenTerms: string[]
- writingStyle: string

### KeywordOpportunity
- keyword: string
- searchVolume: number
- competitionDifficulty: number
- intentScore: number
- opportunityScore: number
- alreadyUsedForArticle: boolean

### Lead
- email: string
- origemCaptura: string
- convertidoEmUsuario: boolean

### SeoMetric
- pageUrl: string
- keyword: string
- clicks: number
- impressions: number
- ctr: number
- position: number
- metricDate: string

### Simulacao
- userId: string
- faturamentoMensal: number
- folhaPagamento: number
- proLabore: number
- rbt12: number
- resultado: record<string

### SupportTicket
- userId: mongooseschema
- subject: string
- message: string

### Empresa
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences

### PlanoAssinatura
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences

### FiscalReminderPreferences
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences

### User
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences
