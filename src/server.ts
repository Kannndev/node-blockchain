import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { AppSetting, logger } from './config';
import { ApiRouting } from './api.routing';
import { SwaggerController } from './controllers/swagger.controller';
import { Blockchain } from './model/BlockChain';
import { Transaction } from './model/Transaction';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const app = express();
const config = AppSetting.getConfig();
const port = config.Port || 4000;

const corsOption = {
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  origin: true
};

function configBlockChain() {
  // Your private key goes here
  const myKey = ec.keyFromPrivate(
    '7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf'
  );

  // From that we can calculate your public key (which doubles as your wallet address)
  const myWalletAddress = myKey.getPublic('hex');

  // Create new instance of Blockchain class
  const myCoin = new Blockchain();

  // Create a transaction & sign it with your key
  const tx1 = new Transaction(myWalletAddress, 'address2', 100);
  tx1.signTransaction(myKey);
  myCoin.addTransaction(tx1);

  // Mine block
  myCoin.minePendingTransactions(myWalletAddress);

  // Create second transaction
  const tx2 = new Transaction(myWalletAddress, 'address1', 50);
  tx2.signTransaction(myKey);
  myCoin.addTransaction(tx2);

  // Mine block
  myCoin.minePendingTransactions(myWalletAddress);

  console.log();
  console.log(
    `Balance of xavier is ${myCoin.getBalanceOfAddress(myWalletAddress)}`
  );

  // Uncomment this line if you want to test tampering with the chain
  // myCoin.chain[1].transactions[0].amount = 10;

  // Check if the chain is valid
  console.log();
  console.log('Blockchain valid?', myCoin.isChainValid() ? 'Yes' : 'No');
}

configBlockChain();

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
