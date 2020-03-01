import { Router } from 'express';
import { BlockchainManager } from '../managers';
import { JoiValidator } from '../config';
import { UserSchema } from '../schema';
import { emit } from '../model/Socket';
import { TransactionTypes } from '../model';
import uuid from 'uuid';
import * as fs from 'fs';
const multer = require('multer');
const fsPromises = fs.promises;
const dir = './uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.js');
  }
});

const upload = multer({ storage });
export class BlockchainController {
  public static route = '/blockchain';
  public router: Router;
  private blockchainManager: BlockchainManager;
  private joiValidator: JoiValidator;

  constructor() {
    this.blockchainManager = new BlockchainManager();
    this.joiValidator = new JoiValidator();
    this.router = Router();
    this.init();
  }

  public init() {
    this.router.post('/', this.ping);
    this.router.get('/all', this.GetAllMessages);
    this.router.post('/receive', this.receiveBlockChain);
    this.router.post(
      '/addSmartContract',
      upload.single('contract'),
      this.addSmartContract
    );
    this.router.post('/executeSmartContract', this.executeSmartContract);
  }

  public ping = async (request, response, nextFunction) => {
    try {
      emit('customEmit', 'New Block / Message Received');
      const result = request.body;
      const validatedResponse = await this.joiValidator.jsonValidator(
        new UserSchema().getPingResponse(),
        result
      );
      const res = await this.blockchainManager.publishMessage(
        validatedResponse,
        ''
      );
      response.send(res);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  public GetAllMessages = async (request, response, nextFunction) => {
    try {
      const result = await this.blockchainManager.GetAllMessages();
      response.send({ data: result.length ? JSON.parse(result) : [] });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  public receiveBlockChain = async (request, response, nextFunction) => {
    try {
      response.status(200).send('Block Received');
      emit('customEmit', 'Receving the ledger data from peers');
      await this.blockchainManager.validateAndReplaceChain(
        JSON.parse(request.body.blockChain)
      );
    } catch (error) {
      response.status(500).send(error);
    }
  };

  public addSmartContract = async (request, response, nextFunction) => {
    try {
      const file = request.file;
      const fileBuffer = await fsPromises.readFile(file.path);
      emit('customEmit', 'Adding a smart contract to the network');
      const message = {
        type: 'smartContract',
        contractDetails: fileBuffer.toString()
      };
      const res = await this.blockchainManager.publishMessage(
        message,
        TransactionTypes.SmartContractCreation
      );
      response.status(200).send(res);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  public executeSmartContract = async (request, response, nextFunction) => {
    try {
      const payload = request.body;
      emit('customEmit', 'Publishing a smart contract call to network');
      const res = await this.blockchainManager.publishMessage(
        payload,
        TransactionTypes.SmartContractExecution
      );
      response.status(200).send(res);
    } catch (error) {
      response.status(500).send(error);
    }
  };
}
