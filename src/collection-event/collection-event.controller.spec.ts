import { Test, TestingModule } from '@nestjs/testing';
import { CollectionEventController } from './collection-event.controller';

describe('CollectionEvent Controller', () => {
  let controller: CollectionEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionEventController],
    }).compile();

    controller = module.get<CollectionEventController>(CollectionEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
