import { IncomingHttpHeaders } from 'http';

declare module 'http' {
    interface IncomingHttpHeaders {
        "mx-token"?: string
    }
}
