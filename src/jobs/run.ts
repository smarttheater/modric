/**
 * 非同期ジョブ
 */
import retry from './continuous/retry/run';
import orderRecieved from './continuous/orderRecieved/run';
// import reservationRecieved from './continuous/reservationRecieved/run';

export default async () => {
    await orderRecieved();
    await retry();
};
