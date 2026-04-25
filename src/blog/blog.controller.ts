import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('public')
  listPublishedArticles(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
    @Query('search') search?: string
  ) {
    return this.blogService.listPublishedArticles({ page, pageSize, search });
  }

  @Get('public/:slug')
  getPublishedArticleBySlug(@Param('slug') slug: string) {
    return this.blogService.getPublishedArticleBySlug(slug);
  }

  @Post()
  createArticle(@Body() payload: CreateArticleDto) {
    return this.blogService.createArticle(payload);
  }

  @Get('/sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemapXml() {
    const baseUrl = 'https://radardosimples.com.br';
    const professionSlugs = [
      'desenvolvedor',
      'advogado',
      'psicologo',
      'arquiteto',
      'contador',
      'consultor',
      'designer',
      'marketing',
      'medico',
      'dentista',
      'fisioterapeuta',
      'nutricionista',
      'personal-trainer',
      'coach',
      'fotografo',
      'redator',
      'social-media',
      'engenheiro',
      'corretor',
      'assistente-virtual',
      'traductor',
      'instrutor',
      'veterinario',
      'terapeuta',
      'assessoria',
      'programador',
      'freelancer',
      'arquitetura',
      'publicidade',
      'eventos',
    ];
    const citySlugs = [
      'sao-paulo',
      'rio-de-janeiro',
      'belo-horizonte',
      'brasilia',
      'curitiba',
      'porto-alegre',
      'salvador',
      'fortaleza',
      'recife',
      'manaus',
      'belem',
      'goiania',
      'vitoria',
      'natal',
      'joao-pessoa',
      'maceio',
      'aracaju',
      'teresina',
      'sao-luis',
      'cuiaba',
      'campo-grande',
      'palmas',
      'rio-branco',
      'porto-velho',
      'boa-vista',
      'macapa',
      'florianopolis',
    ];
    const publishedItems =
      await this.blogService.getPublishedSlugsWithLastModification();
    const staticUrls = [
      '/',
      '/simulador',
      '/planos',
      '/sobre',
      '/recursos',
      '/suporte',
      '/blog',
    ];

    const staticEntries = staticUrls
      .map(
        (path) =>
          `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
      )
      .join('');

    const blogEntries = publishedItems
      .map((item) => {
        const lastModification = item.updatedAt ?? item.publishedAt;
        const lastModificationAsIso = lastModification
          ? new Date(lastModification).toISOString()
          : new Date().toISOString();
        return `<url><loc>${baseUrl}/blog/${item.slug}</loc><lastmod>${lastModificationAsIso}</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`;
      })
      .join('');

    const programmaticEntries = professionSlugs
      .flatMap((professionSlug) =>
        citySlugs.map(
          (citySlug) =>
            `<url><loc>${baseUrl}/simulador/fator-r/${professionSlug}/${citySlug}</loc><changefreq>weekly</changefreq><priority>0.72</priority></url>`
        )
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${blogEntries}${programmaticEntries}</urlset>`;
  }
}
