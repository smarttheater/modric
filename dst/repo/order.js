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
const order_1 = require("./mongoose/model/order");
/**
 * Orderリポジトリー
 */
class MongoRepository {
    constructor(connection) {
        this.orderModel = connection.model(order_1.modelName);
    }
    /**
     * 注文番号と注文ステータスから注文を取得する
    */
    findByOrderNumber(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.orderModel.findOne({
                orderNumber: params.orderNumber,
                orderStatus: params.orderStatus
            }, {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            })
                .exec();
            if (doc === null) {
                throw new Error('Order');
            }
            return doc.toObject();
        });
    }
}
exports.MongoRepository = MongoRepository;
