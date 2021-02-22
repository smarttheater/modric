/**
 * 注文受信監視
 */
import { MongoRepository as OrderRepo } from '../../../repo/order';
import { MongoRepository as TaskRepo } from '../../../repo/task';
import logger from '../../../app/middlewares/bunyanLogger';
import { auth, service } from '@cinerino/sdk/lib';
// import * as moment from 'moment';

import { connectMongo } from '../../../connectMongo';

export default async () => {
    const connection = await connectMongo({ defaultConnection: false });
    const taskName = 'orderRecieved';

    let count = 0;

    const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
    const INTERVAL_MILLISECONDS = 1000;
    // const transactionRepo = new cinerino.repository.Transaction(connection);
    const orderRepo = new OrderRepo(connection);
    const taskRepo = new TaskRepo(connection);
    setInterval(
        async () => {
            if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
                return;
            }

            count += 1;

            try {
                // findoneupdateしてprocessing
                const task = await taskRepo.startProcess(taskName);
                if (task === null) { count -= 1; return; }

                // 潜在ポイントを計算
                const order = await orderRepo.findByOrderNumber({ orderNumber: task.dataKey, orderStatus: task.dataStatus });

                if (order.customer.typeOf === 'Person' && order.project.id.includes('sskts')) {

                    // "typeOf": "EventReservation",
                    // "typeOf": "ProgramMembership",
                    const eventReservations = order.acceptedOffers.filter((offer: any) => {
                        return offer?.itemOffered?.typeOf == 'EventReservation'
                    });

                    if (eventReservations.length > 0) {
                        let potentialPoint = eventReservations.length;

                        // ssktsはチネ側で1ポイント付与済みなので、マイナス1しておく
                        potentialPoint -= 1

                        const coaTicketInfos = eventReservations.map((offer: { itemOffered: { reservedTicket: { coaTicketInfo: { usePoint: any; }; }; }; }) => {
                            return offer?.itemOffered?.reservedTicket?.coaTicketInfo
                        });

                        coaTicketInfos.forEach((coaTicketInfo: { usePoint: number; kbnMgtk: string; } | undefined) => {
                            if (coaTicketInfo === undefined) { return }
                            if (coaTicketInfo.usePoint > 0 || coaTicketInfo.kbnMgtk === "MG") { potentialPoint -= 1 }
                        })
                        if (potentialPoint > 0) {
                            logger.info({ orderNumber: task.dataKey, potentialPoint: potentialPoint }, `orderNumber:${task.dataKey} , potentialPoint:${potentialPoint} ,account opening..`);

                            // peco叩く
                            const authClient = new auth.ClientCredentials({
                                domain: <string>process.env.AUTHORIZE_SERVER_DOMAIN,
                                clientId: <string>process.env.CLIENT_ID,
                                clientSecret: <string>process.env.CLIENT_SECRET,
                                scopes: [],
                                state: ''
                            });

                            const accountService = new service.Account({
                                endpoint: <string>process.env.API_ENDPOINT,
                                auth: authClient,
                                project: { id: order.project.id }
                            });
                            await accountService.openByToken({
                                instrument: {
                                    token: order.token
                                },
                                object: {
                                    typeOf: 'Account',
                                    initialBalance: potentialPoint
                                }
                            });
                            logger.info({ orderNumber: task.dataKey, potentialPoint: potentialPoint }, `orderNumber:${task.dataKey} , potentialPoint:${potentialPoint} ,account opened`);
                        }
                    }
                }

                await taskRepo.completeProcess(task)
            } catch (error) {
                console.error(error);
            }

            count -= 1;
        },
        INTERVAL_MILLISECONDS
    );
};
