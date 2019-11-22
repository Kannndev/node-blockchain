import * as joi from 'joi';
import { Response, NextFunction } from 'express';

export class JoiValidator {
  public jsonValidator(joiSchema: object, jsonValue: any) {
    return new Promise((resolve, reject) => {
      joi
        .validate(jsonValue, joiSchema, { stripUnknown: true })
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          reject(new Error(error).toString());
        });
    });
  }
}
