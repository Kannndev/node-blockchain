import * as joi from 'joi';

export class UserSchema {
  public getPingResponse() {
    return joi.object({
      name: joi.string().required(),
      message: joi.string().required()
    });
  }
}
