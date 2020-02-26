

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        req.connection.setTimeout(240000);
        res.connection.setTimeout(240000);
        next();
    }
}
