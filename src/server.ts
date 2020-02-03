import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { AppSetting, logger } from './config';
import { ApiRouting } from './api.routing';
import { SwaggerController } from './controllers/swagger.controller';
import { Subscribe } from './model';

const app = express();
const config = AppSetting.getConfig();
const port = config.Port || 4000;

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

app.listen(port);

console.log(`Server running at http://localhost:${port}/`);

const amqp = require('amqplib/callback_api');

const CONN_URL = 'amqp://bvznphpr:MdfR_vMpY-6z0R1AfoUtlcZG9KnSM66v@shrimp.rmq.cloudamqp.com/bvznphpr';

amqp.connect(CONN_URL, (err, conn) => {
   conn.createChannel((error, channel) => {
      global['channel'] = channel;
      global['queueName'] = 'demo-msgs';
      new Subscribe().subscribeBlock();
      new Subscribe().subscribeBlockAck();
   });
});

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
