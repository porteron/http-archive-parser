import { Controller, Post, Req, Request } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { reportGenerator } from '../parser/har/report-generator';


// @UseGuards(AuthGuard('jwt'))
@ApiUseTags('collection-event')
@Controller('collection-event')
export class CollectionEventController {


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
