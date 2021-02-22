/**
 * Expressアプリケーション
 */
import * as middlewares from '@motionpicture/express-middleware';
import * as bodyParser from 'body-parser';
import flash = require('connect-flash');
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as createDebug from 'debug';
import * as express from 'express';
import * as session from 'express-session';
import * as expressValidator from 'express-validator';
import locals from './middlewares/locals';
import * as multer from 'multer';
import * as helmet from 'helmet';
import * as qs from 'qs';

import { connectMongo } from '../connectMongo';

import errorHandler from './middlewares/errorHandler';
import router from './routes/router';

const debug = createDebug('modric-api:*');

const app = express();
app.set('query parser', (str: any) => qs.parse(str, {
    arrayLimit: 1000,
    parseArrays: true,
    depth: 10,
    allowDots: false,
    allowPrototypes: false
}));

// for parsing multipart/form-data
let storage = multer.memoryStorage()
app.use(multer({ storage: storage }).single('imageFile'));

app.use(cookieParser());
app.use(flash());
// 以下追加
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000
    }
}));

app.use(locals); // テンプレート変数

app.use(middlewares.basicAuth({ // ベーシック認証
    name: process.env.BASIC_AUTH_NAME,
    pass: process.env.BASIC_AUTH_PASS,
    unauthorizedHandler: (__, res, next) => {
        res.setHeader('WWW-Authenticate', 'Basic realm="modric-api Authentication"');
        next(new Error('Unauthorize'));
    }
}));

const options: cors.CorsOptions = {
    origin: '*',
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization'],
    credentials: false,
    methods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(options));

app.use(helmet());
// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ['\'self\''],
//         // styleSrc: ['\'unsafe-inline\''],
//         styleSrc: ['\'self\'','\'unsafe-inline\''],
//         scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'ajax.googleapis.com']
//     }
// }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
const SIXTY_DAYS_IN_SECONDS = 5184000;
app.use(helmet.hsts({
    maxAge: SIXTY_DAYS_IN_SECONDS,
    includeSubdomains: false
}));

// api version
// tslint:disable-next-line:no-require-imports no-var-requires
const packageInfo = require('../../package.json');
app.use((__, res, next) => {
    res.setHeader('x-app-verion', <string>packageInfo.version);
    res.locals.version = <string>packageInfo.version;
    next();
});

// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    // サーバーエラーテスト
    app.get('/dev/uncaughtexception', (req) => {
        req.on('data', (chunk) => {
            debug(chunk);
        });

        req.on('end', () => {
            throw new Error('uncaughtexception manually');
        });
    });
}

app.use(bodyParser.json({ limit: '1mb' }));
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
// app.use(express.static(`${__dirname}/../public`));
app.use(expressValidator({})); // this line must be immediately after any of the bodyParser middlewares!

connectMongo({ defaultConnection: true })
    .then()
    .catch((err) => {
        // tslint:disable-next-line:no-console
        console.error('connetMongo:', err);
        process.exit(1);
    });

// routers
app.use('/', router);

// 404
// app.use(notFoundHandler);

// error handlers
app.use(errorHandler);

export = app;
