import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SeoAutopilotService } from './seo-autopilot.service';

type SeoAutopilotCommand =
  | 'collect-keyword-research'
  | 'generate-draft-article'
  | 'publish-scheduled-articles'
  | 'notify-index-now'
  | 'all';

function normalizeCommandName(commandName: string | undefined) {
  if (!commandName) {
    return 'all' as const;
  }

  const normalizedCommandName = commandName.trim().toLowerCase();

  if (
    normalizedCommandName === 'collect-keyword-research' ||
    normalizedCommandName === 'generate-draft-article' ||
    normalizedCommandName === 'publish-scheduled-articles' ||
    normalizedCommandName === 'notify-index-now' ||
    normalizedCommandName === 'all'
  ) {
    return normalizedCommandName;
  }

  throw new Error(
    `Comando inválido: ${commandName}. Use collect-keyword-research, generate-draft-article, publish-scheduled-articles, notify-index-now ou all.`
  );
}

function getCommandLineArgumentValue(argumentName: string) {
  const matchingArgument = process.argv.find((argument) =>
    argument.startsWith(`${argumentName}=`)
  );

  if (!matchingArgument) {
    return null;
  }

  const [, argumentValue] = matchingArgument.split('=');
  return argumentValue ?? null;
}

function getCommandNameFromArguments() {
  return process.argv.slice(2).find((argument) => !argument.startsWith('--'));
}

function applyMongoDbOverride() {
  const mongoDbUri =
    getCommandLineArgumentValue('--mongo-uri') ||
    process.env.SEO_AUTOPILOT_MONGODB_URI ||
    (process.argv.includes('--use-local-mongodb')
      ? 'mongodb://localhost:27017/painel-pj'
      : null);

  if (mongoDbUri) {
    process.env.MONGODB_URI = mongoDbUri;
  }
}

async function executeCommand(
  seoAutopilotService: SeoAutopilotService,
  commandName: SeoAutopilotCommand
) {
  if (commandName === 'collect-keyword-research') {
    await seoAutopilotService.collectWeeklyKeywordResearch();
    return;
  }

  if (commandName === 'generate-draft-article') {
    await seoAutopilotService.generateNextDayDraftArticle();
    return;
  }

  if (commandName === 'publish-scheduled-articles') {
    await seoAutopilotService.publishScheduledArticles();
    return;
  }

  if (commandName === 'notify-index-now') {
    await seoAutopilotService.notifyIndexNow();
    return;
  }

  await seoAutopilotService.collectWeeklyKeywordResearch();
  await seoAutopilotService.generateNextDayDraftArticle();
  await seoAutopilotService.publishScheduledArticles();
  await seoAutopilotService.notifyIndexNow();
}

async function bootstrap() {
  const commandName = normalizeCommandName(getCommandNameFromArguments());
  applyMongoDbOverride();
  const { AppModule } = await import('../app.module');
  const applicationContext = await NestFactory.createApplicationContext(
    AppModule
  );
  const seoAutopilotService = applicationContext.get(SeoAutopilotService);

  try {
    console.log(
      `Iniciando execução manual do SeoAutopilotService com comando: ${commandName}`
    );
    await executeCommand(seoAutopilotService, commandName);
    console.log(
      'Execução manual do SeoAutopilotService concluída com sucesso.'
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Falha ao executar o SeoAutopilotService: ${errorMessage}`);
    process.exitCode = 1;
  } finally {
    await applicationContext.close();
  }
}

void bootstrap();
