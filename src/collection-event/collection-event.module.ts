import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TimeoutMiddleware } from '../middleware/timeout.middleware';
import { CollectionEventController } from './collection-event.controller';

@Module({
  controllers: [CollectionEventController],
})

export class CollectionEventModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TimeoutMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
