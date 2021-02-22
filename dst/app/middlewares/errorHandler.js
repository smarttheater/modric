"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * エラーハンドラーミドルウェア
 */
const createDebug = require("debug");
const http_status_1 = require("http-status");
const api_1 = require("../error/api");
const debug = createDebug('modoric-api:middlewares');
exports.default = (err, req, res, next) => {
    debug(req.originalUrl, err);
    if (res.headersSent) {
        next(err);
        return;
    }
    let apiError;
    if (err instanceof api_1.APIError) {
        apiError = err;
    }
    else {
        // エラー配列が入ってくることもある
        if (Array.isArray(err)) {
            apiError = new api_1.APIError(Error2httpStatusCode(err[0]), err);
        }
        else if (err instanceof Error) {
            apiError = new api_1.APIError(Error2httpStatusCode(err), [err]);
        }
        else {
            // 500
            // apiError = new APIError(INTERNAL_SERVER_ERROR, [new modoric.factory.errors.modoric(<any>'InternalServerError', err.message)]);
            apiError = new api_1.APIError(http_status_1.INTERNAL_SERVER_ERROR, [err.message]);
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
function Error2httpStatusCode(err) {
    let statusCode = http_status_1.BAD_REQUEST;
    switch (true) {
        // 401
        case (err.status === 401):
            statusCode = http_status_1.UNAUTHORIZED;
            break;
        // 403
        case (err.status === 403):
            statusCode = http_status_1.FORBIDDEN;
            break;
        // 404
        case (err.status === 404):
            statusCode = http_status_1.NOT_FOUND;
            break;
        // 409
        case (err.status === 409):
            statusCode = http_status_1.CONFLICT;
            break;
        // 429
        case (err.status === 429):
            statusCode = http_status_1.TOO_MANY_REQUESTS;
            break;
        // 502
        case (err.status === 502):
            statusCode = http_status_1.NOT_IMPLEMENTED;
            break;
        // 503
        case (err.status == 503):
            statusCode = http_status_1.SERVICE_UNAVAILABLE;
            break;
        // 500
        default:
            statusCode = http_status_1.INTERNAL_SERVER_ERROR;
    }
    return statusCode;
}
