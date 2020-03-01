import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import ip from 'ip';
import { AppSetting, logger } from './config';
import { ApiRouting } from './api.routing';
import { SwaggerController } from './controllers/swagger.controller';
import { Subscribe, Publish } from './model';
import { BlockchainManager } from './managers/blockchain.manager';
const http = require('http');

import { emit, socketEmit } from './model/Socket';

const app = express();
const config = AppSetting.getConfig();
global['port'] = config.Port || 4000;

const corsOption = {
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  origin: true
};

function configureMiddleWare() {
  const swaggerDocs = new SwaggerController(app);
  app.use(cors(corsOption));
  app.use(bodyParser.json());
}

configureMiddleWare();

ApiRouting.Register(app);

app.use((err, req, res, next) => {
  logger.error(err.toString());
});

app.listen(global['port']);

console.log(`Server running at http://localhost:${global['port']}/`);

const amqp = require('amqplib/callback_api');

const CONN_URL =
  'amqp://bvznphpr:MdfR_vMpY-6z0R1AfoUtlcZG9KnSM66v@shrimp.rmq.cloudamqp.com/bvznphpr';

amqp.connect(CONN_URL, (err, conn) => {
  conn.createChannel(async (error, channel) => {
    try {
      const blockchainManager = new BlockchainManager();
      const subscribe = new Subscribe();
      global['channel'] = channel;
      global['queueName'] = 'demo-msgs';
      subscribe.subscribeBlock();
      subscribe.subscribeBlockAck();
      await subscribe.subscribeNewMember();
      blockchainManager.initiateChain();
      setTimeout(() => {
        new Publish().publishBlock('newMember', {
          apiURL: `http://${ip.address()}:${global['port']}/blockchain/receive`,
          httpMethod: 'POST'
        });
      }, 5000);
    } catch (err) {
      console.log(err);
    }
  });
});

socketEmit();

process
  .on('warning', reason => {
    logger.warn(reason.toString());
  })
  .on('unhandledRejection', (reason, p) => {
    logger.error(reason.toString());
  })
  .on('uncaughtException', err => {
    logger.error(err.toString());
    process.exit(1);
  });
