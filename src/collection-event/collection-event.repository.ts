import { EntityRepository, Repository } from 'typeorm';
import CollectionEventDto from './collection-event.dto';
import { collection_event as CollectionEvent } from '../interfaces/entities/collection_event';

//  Now, to manipulate the collection-event objects, you need to create a repository collection-event/collection-event.repository.ts.

@EntityRepository(CollectionEvent)
export class CollectionEventRepository extends Repository<CollectionEvent> {
  createCollectionEvent = async (collectionEvent: CollectionEventDto) => {
    console.log("Create Collection Event: ", collectionEvent )
    return await this.save(collectionEvent);
  };

  findOneCollectionEvent = async (name: string) => {
    return this.findOneOrFail(name);
  };

  updateCollectionEvent = async (id: number, collectionEvent: CollectionEventDto) => {
    return this.save({ ...collectionEvent, id: Number(id) });
  };

  removeCollectionEvent = async (id: number) => {
    await this.findOneOrFail(id);
    return this.delete(id);
  };

}
