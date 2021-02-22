
import { Connection, Model } from 'mongoose';
import { modelName } from './mongoose/model/order';

/**
 * Orderリポジトリー
 */
export class MongoRepository {
    public readonly orderModel: typeof Model;

    constructor(connection: Connection) {
        this.orderModel = connection.model(modelName);
    }

    /**
     * 注文番号と注文ステータスから注文を取得する
    */
    public async findByOrderNumber(params: {
        orderNumber: string
        orderStatus: string
    }): Promise<any> {
        const doc = await this.orderModel.findOne(
            {
                orderNumber: params.orderNumber,
                orderStatus: params.orderStatus
            },
            {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            }
        )
            .exec();
        if (doc === null) {
            throw new Error('Order');
        }

        return doc.toObject();
    }
}
