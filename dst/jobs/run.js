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
 * 非同期ジョブ
 */
const run_1 = require("./continuous/retry/run");
const run_2 = require("./continuous/orderRecieved/run");
// import reservationRecieved from './continuous/reservationRecieved/run';
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    yield run_2.default();
    yield run_1.default();
});
