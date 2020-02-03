import * as joi from 'joi';

export class UserSchema {
  public getPingResponse() {
    return joi.any();
  }
}
