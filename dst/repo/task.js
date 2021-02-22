"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRepository = void 0;
const task_1 = require("./mongoose/model/task");
const moment = require("moment");
/**
 * Taskリポジトリー
 */
class MongoRepository {
    constructor(connection) {
        this.taskModel = connection.model(task_1.modelName);
    }
    /**
     * タスク名毎にQUEUEDジョブを開始する
     */
    startProcess(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.taskModel.findOneAndUpdate({
                name: name,
                status: 'QUEUED',
            }, { status: 'PROCESSING' }, { new: true })
                .exec()
                .then((doc) => (doc === null) ? null : doc.toObject());
        });
    }
    /**
     * 完了したタスクを完了する
     */
    completeProcess(task) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.taskModel.findOneAndUpdate({
                name: task.name,
                dataKey: task.dataKey,
                dataStatus: task.dataStatus,
                status: 'PROCESSING'
            }, { status: 'COMPLETED' }, { new: true })
                .exec()
                .then((doc) => (doc === null) ? null : doc.toObject());
        });
    }
    // tslint:disable-next-line:no-suspicious-comment
    /**
     * タスクエクスポートリトライ
     * TODO updatedAtを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
     */
    retry() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taskModel.findOneAndUpdate({
                status: 'PROCESSING',
                updatedAt: {
                    $lt: moment()
                        .add(-10, 'minutes')
                        .toDate()
                }
            }, {
                status: 'QUEUED'
            })
                .exec();
        });
    }
}
exports.MongoRepository = MongoRepository;
