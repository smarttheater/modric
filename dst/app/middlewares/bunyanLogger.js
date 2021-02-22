"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Imports the Google Cloud client library for Bunyan
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');
const bunyan = require("bunyan");
const loggingBunyan = new LoggingBunyan();
const logger = bunyan.createLogger({
    // The JSON payload of the log as it appears in Stackdriver Logging
    // will contain "name": "my-service"
    name: 'smart-theater-modric',
    streams: [
        // Log to the console at 'info' and above
        // { stream: process.stdout, level: 'info' },
        // And log to Stackdriver Logging, logging at 'info' and above
        loggingBunyan.stream('info'),
    ],
});
exports.default = logger;
