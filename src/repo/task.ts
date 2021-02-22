
import { Connection, Model } from 'mongoose';
import { modelName } from './mongoose/model/task';
import * as moment from 'moment';


/**
 * Taskリポジトリー
 */
export class MongoRepository {
    public readonly taskModel: typeof Model;

    constructor(connection: Connection) {
        this.taskModel = connection.model(modelName);
    }

    /**
     * タスク名毎にQUEUEDジョブを開始する
     */
    public async startProcess(name: String): Promise<any | null> {
        return this.taskModel.findOneAndUpdate(
            {
                name: name,
                status: 'QUEUED',
            },
            { status: 'PROCESSING' },
            { new: true }
        )
            .exec()
            .then((doc) => (doc === null) ? null : doc.toObject());
    }

    /**
     * 完了したタスクを完了する
     */
    public async completeProcess(task: any): Promise<any | null> {
        return this.taskModel.findOneAndUpdate(
            {
                name:task.name,
                dataKey: task.dataKey,
                dataStatus: task.dataStatus,
                status: 'PROCESSING'
            },
            { status: 'COMPLETED' },
            { new: true }
        )
            .exec()
            .then((doc) => (doc === null) ? null : doc.toObject());
    }

    // tslint:disable-next-line:no-suspicious-comment
    /**
     * タスクエクスポートリトライ
     * TODO updatedAtを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
     */
    public async retry(): Promise<void> {
        await this.taskModel.findOneAndUpdate(
            {
                status: 'PROCESSING',
                updatedAt: {
                    $lt: moment()
                        .add(-10, 'minutes')
                        .toDate()
                }
            },
            {
                status: 'QUEUED'
            }
        )
            .exec();
    }
}
