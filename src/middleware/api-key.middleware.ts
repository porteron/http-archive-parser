
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { API_KEYS } from './api-keys'

@Injectable()
export class APIKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    if (!API_KEYS[String(req.headers["mx-token"])]) {
      res.statusCode = 403;
      res.end("Invalid or missing API KEY")
    } else {
      console.log(API_KEYS[String(req.headers["mx-token"])].account, ' - ', new Date())
    }
    next();
  }
}
