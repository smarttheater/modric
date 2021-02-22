"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.modelName = void 0;
const mongoose = require("mongoose");
const modelName = 'Task';
exports.modelName = modelName;
const writeConcern = { j: true, w: 'majority', wtimeout: 10000 };
/**
 * Taskスキーマ
 * @ignore
 */
const schema = new mongoose.Schema({}, {
    collection: 'tasks',
    id: true,
    read: 'primaryPreferred',
    writeConcern: writeConcern,
    strict: false,
    useNestedStrict: true,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    toJSON: {
        getters: false,
        virtuals: false,
        minimize: false,
        versionKey: false
    },
    toObject: {
        getters: false,
        virtuals: true,
        minimize: false,
        versionKey: false
    }
});
exports.schema = schema;
mongoose.model(modelName, schema)
    .on('index', 
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
(error) => {
    if (error !== undefined) {
        // tslint:disable-next-line:no-console
        console.error(error);
    }
});
