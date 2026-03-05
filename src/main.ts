import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
 const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true, // Necessário para verificar assinatura do webhook Stripe
 });
 app.enableCors({ origin: ["http://localhost:4200"] });
 app.useGlobalPipes(
  new ValidationPipe({
   whitelist: true,
   transform: true,
   transformOptions: { enableImplicitConversion: true },
  })
 );
 const port = process.env.PORT || 3000;
 await app.listen(port);
}
bootstrap();
