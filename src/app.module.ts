import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionEventModule } from './collection-event/collection-event.module';
import { APIKeyMiddleware } from './middleware/api-key.middleware';

@Module({
  imports: [
    // TypeOrmModule.forRoot(),
    CollectionEventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(APIKeyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
