import { Module, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEventController } from './collection-event.controller';
import { CollectionEventRepository } from './collection-event.repository';
import { collection_event as CollectionEvent } from '../interfaces/entities/collection_event';
import { TimeoutMiddleware } from '../middleware/timeout.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEvent, CollectionEventRepository])],
  controllers: [CollectionEventController],
})

export class CollectionEventModule { 
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TimeoutMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
