/**
 * 取引タスクエクスポートが実行中のままになっている取引を監視する
 */
import * as createDebug from 'debug';

import { connectMongo } from '../../../connectMongo';
import { MongoRepository as TaskRepo } from '../../../repo/task';

const debug = createDebug('cinerino-api');

export default async () => {
    const connection = await connectMongo({ defaultConnection: false });

    let countRetry = 0;

    const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
    const INTERVAL_MILLISECONDS = 100;
    const taskRepo = new TaskRepo(connection);
    // const RETRY_INTERVAL_MINUTES = 10;

    setInterval(
        async () => {
            if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
                return;
            }

            countRetry += 1;

            try {
                debug('reexporting tasks...');
                await taskRepo.retry();
            } catch (error) {
                console.error(error);
            }

            countRetry -= 1;
        },
        INTERVAL_MILLISECONDS
    );
};
