import { Controller, Post, Req } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { reportGenerator } from '../parser/har/report-generator';
import { generateMetadata } from '../utils/generate-metadata';
import { CollectionEventRepository } from './collection-event.repository';


// @UseGuards(AuthGuard('jwt'))
@ApiUseTags('collection-event')
@Controller('collection-event')
export class CollectionEventController {
    constructor(
        @InjectRepository(CollectionEventRepository) private readonly collectionEventRepository: CollectionEventRepository,
    ) { }


    @Post('/metadata')
    async metadata(@Req() request: Request) {
        try {
            let collectionEventData = await generateMetadata(request)
            this.collectionEventRepository.createCollectionEvent(collectionEventData);
            reportGenerator({ report_type: 'sharedStrings', files: [collectionEventData.name], format: 'json', save: true, update: false });
            return { success: true }
        } catch (error) {
            return { error: true }
        }
    }

    @Post('/parse')
    async parse(@Req() request: Request) {
        try {
            let report: Object = await reportGenerator(request.body);
            return report;
        } catch (error) {
            return { error: error }
        }
    }
}
