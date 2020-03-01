import * as express from 'express';
import { AppSetting } from './config/app.setting';
import { BlockchainController } from './controllers';

export class ApiRouting {
  public static Register(app: express.Express) {
    app.use(BlockchainController.route, new BlockchainController().router);
  }
}
