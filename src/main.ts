import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const cors = require('cors');
const corsOptions = { origin: '*', optionsSuccessStatus: 200 };

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true, bodyLimit: 104857600 }),
  );

  app.use(cors(corsOptions));

  const swaggerOptions = new DocumentBuilder()
    .setTitle('HTTP Archive Tools API')
    .setDescription('HAR Tool API Documentation')
    .setVersion('1.0')
    .addTag('HTTP Archive Tools')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT;
  const HOST = '0.0.0.0';

  await app.listen(PORT, HOST);

  console.log(`\nServer running at http://${HOST}:${PORT}`);
}
bootstrap();
