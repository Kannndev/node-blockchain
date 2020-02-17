import { Router } from 'express';
import { UserManager } from '../managers';
import { JoiValidator } from '../config';
import { UserSchema } from '../schema';
import { emit } from '../model/Socket';

export class UserController {
  public static route = '/blockchain';
  public router: Router;
  private userManager: UserManager;
  private joiValidator: JoiValidator;

  constructor() {
    this.userManager = new UserManager();
    this.joiValidator = new JoiValidator();
    this.router = Router();
    this.init();
  }

  public init() {
    this.router.post('/', this.ping);
    this.router.get('/all', this.GetAllMessages);
    this.router.post('/receive', this.receiveBlockChain);
  }

  public ping = async (request, response, nextFunction) => {
    try {
      emit('customEmit', 'New Block / Message Received');
      const result = request.body;
      const validatedResponse = await this.joiValidator.jsonValidator(
        new UserSchema().getPingResponse(),
        result
      );
      await this.userManager.publishMessage(validatedResponse);
      response.send(validatedResponse);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  public GetAllMessages = async (request, response, nextFunction) => {
    try {
      const result = await this.userManager.GetAllMessages();
      response.send({ data: result.length ? JSON.parse(result) : [] });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  public receiveBlockChain = async (request, response, nextFunction) => {
    try {
      response.status(200).send('Block Received');
      emit('customEmit', 'Receving the ledger data from peers');
      await this.userManager.validateAndReplaceChain(
        JSON.parse(request.body.blockChain)
      );
    } catch (error) {
      response.status(500).send(error);
    }
  };
}
