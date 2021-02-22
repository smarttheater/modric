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
/**
 * 注文受信監視
 */
const order_1 = require("../../../repo/order");
const task_1 = require("../../../repo/task");
const bunyanLogger_1 = require("../../../app/middlewares/bunyanLogger");
const lib_1 = require("@cinerino/sdk/lib");
// import * as moment from 'moment';
const connectMongo_1 = require("../../../connectMongo");
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield connectMongo_1.connectMongo({ defaultConnection: false });
    const taskName = 'orderRecieved';
    let count = 0;
    const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
    const INTERVAL_MILLISECONDS = 1000;
    // const transactionRepo = new cinerino.repository.Transaction(connection);
    const orderRepo = new order_1.MongoRepository(connection);
    const taskRepo = new task_1.MongoRepository(connection);
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }
        count += 1;
        try {
            // findoneupdateしてprocessing
            const task = yield taskRepo.startProcess(taskName);
            if (task === null) {
                count -= 1;
                return;
            }
            // 潜在ポイントを計算
            const order = yield orderRepo.findByOrderNumber({ orderNumber: task.dataKey, orderStatus: task.dataStatus });
            if (order.customer.typeOf === 'Person' && order.project.id.includes('sskts')) {
                // "typeOf": "EventReservation",
                // "typeOf": "ProgramMembership",
                const eventReservations = order.acceptedOffers.filter((offer) => {
                    var _a;
                    return ((_a = offer === null || offer === void 0 ? void 0 : offer.itemOffered) === null || _a === void 0 ? void 0 : _a.typeOf) == 'EventReservation';
                });
                if (eventReservations.length > 0) {
                    let potentialPoint = eventReservations.length;
                    // ssktsはチネ側で1ポイント付与済みなので、マイナス1しておく
                    potentialPoint -= 1;
                    const coaTicketInfos = eventReservations.map((offer) => {
                        var _a, _b;
                        return (_b = (_a = offer === null || offer === void 0 ? void 0 : offer.itemOffered) === null || _a === void 0 ? void 0 : _a.reservedTicket) === null || _b === void 0 ? void 0 : _b.coaTicketInfo;
                    });
                    coaTicketInfos.forEach((coaTicketInfo) => {
                        if (coaTicketInfo === undefined) {
                            return;
                        }
                        if (coaTicketInfo.usePoint > 0 || coaTicketInfo.kbnMgtk === "MG") {
                            potentialPoint -= 1;
                        }
                    });
                    if (potentialPoint > 0) {
                        bunyanLogger_1.default.info({ orderNumber: task.dataKey, potentialPoint: potentialPoint }, `orderNumber:${task.dataKey} , potentialPoint:${potentialPoint} ,account opening..`);
                        // peco叩く
                        const authClient = new lib_1.auth.ClientCredentials({
                            domain: process.env.AUTHORIZE_SERVER_DOMAIN,
                            clientId: process.env.CLIENT_ID,
                            clientSecret: process.env.CLIENT_SECRET,
                            scopes: [],
                            state: ''
                        });
                        const accountService = new lib_1.service.Account({
                            endpoint: process.env.API_ENDPOINT,
                            auth: authClient,
                            project: { id: order.project.id }
                        });
                        yield accountService.openByToken({
                            instrument: {
                                token: order.token
                            },
                            object: {
                                typeOf: 'Account',
                                initialBalance: potentialPoint
                            }
                        });
                        bunyanLogger_1.default.info({ orderNumber: task.dataKey, potentialPoint: potentialPoint }, `orderNumber:${task.dataKey} , potentialPoint:${potentialPoint} ,account opened`);
                    }
                }
            }
            yield taskRepo.completeProcess(task);
        }
        catch (error) {
            console.error(error);
        }
        count -= 1;
    }), INTERVAL_MILLISECONDS);
});
