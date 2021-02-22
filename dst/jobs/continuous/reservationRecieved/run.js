"use strict";
/**
 * 予約受信監視
 */
// import * as moment from 'moment';
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
// import { connectMongo } from '../../../connectMongo';
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    let count = 0;
    const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
    const INTERVAL_MILLISECONDS = 1000;
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }
        count += 1;
        try {
            // no ops
        }
        catch (error) {
            console.error(error);
        }
        count -= 1;
    }), INTERVAL_MILLISECONDS);
});
