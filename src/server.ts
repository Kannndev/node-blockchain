import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { AppSetting, logger } from './config';
import { sequelize } from './helpers/sequelize.config';
import { ApiRouting } from './api.routing';
import { SwaggerController } from './controllers/swagger.controller';

const app = express();
const config = AppSetting.getConfig();
const port = config.Port || 4000;
sequelize.setConnection();

const corsOption = {
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  origin: true
};

function configureMiddleWare() {
  new SwaggerController(app);
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
