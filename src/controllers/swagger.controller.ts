import * as express from 'express';
import { Request, Response, NextFunction, Router, Express } from 'express';
const swaggerUi = require('swagger-ui-express');
const defaultDoc = require('../swagger-docs/user.json');

export class SwaggerController {
  public static returnSwagger = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    return response.sendFile('./swagger-docs/index.html', { root: __dirname });
  };

  constructor(app: Express) {
    this.Register(app);
  }

  private Register(app: express.Express) {
    const route = '/swagger';
    app.use(
      route + '/user',
      swaggerUi.serve,
      swaggerUi.setup(defaultDoc, false)
    );
  }
}
