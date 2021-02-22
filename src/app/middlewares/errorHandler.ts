/**
 * エラーハンドラーミドルウェア
 */
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import {
    BAD_REQUEST,
    CONFLICT, FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NOT_IMPLEMENTED,
    SERVICE_UNAVAILABLE,
    TOO_MANY_REQUESTS,
    UNAUTHORIZED
} from 'http-status';

import { APIError } from '../error/api';

const debug = createDebug('modoric-api:middlewares');

export default (err: any, req: Request, res: Response, next: NextFunction) => {
    debug(req.originalUrl, err);

    if (res.headersSent) {
        next(err);

        return;
    }

    let apiError: APIError;
    if (err instanceof APIError) {
        apiError = err;
    } else {
        // エラー配列が入ってくることもある
        if (Array.isArray(err)) {
            apiError = new APIError(Error2httpStatusCode(err[0]), err);
        } else if (err instanceof Error) {
            apiError = new APIError(Error2httpStatusCode(err), [err]);
        } else {
            // 500
            // apiError = new APIError(INTERNAL_SERVER_ERROR, [new modoric.factory.errors.modoric(<any>'InternalServerError', err.message)]);
            apiError = new APIError(INTERNAL_SERVER_ERROR, [err.message]);
        }
    }

    res.status(apiError.code)
        .json({
            error: apiError.toObject()
        });
};

/**
 * 内部エラーをHTTPステータスコードへ変換する
 */
function Error2httpStatusCode(err: any) {
    let statusCode = BAD_REQUEST;

    switch (true) {
        // 401
        case (err.status === 401):
            statusCode = UNAUTHORIZED;
            break;

        // 403
        case (err.status === 403):
            statusCode = FORBIDDEN;
            break;

        // 404
        case (err.status === 404):
            statusCode = NOT_FOUND;
            break;

        // 409
        case (err.status === 409):
            statusCode = CONFLICT;
            break;

        // 429
        case (err.status === 429):
            statusCode = TOO_MANY_REQUESTS;
            break;

        // 502
        case (err.status === 502):
            statusCode = NOT_IMPLEMENTED;
            break;

        // 503
        case (err.status == 503):
            statusCode = SERVICE_UNAVAILABLE;
            break;

        // 500
        default:
            statusCode = INTERNAL_SERVER_ERROR;
    }

    return statusCode;
}
