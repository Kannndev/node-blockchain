import { Blockchain, Publish, TransactionTypes } from '../model';
import uuid from 'uuid';
import rp from 'request-promise';
import * as fs from 'fs';
import ip from 'ip';
import { emit } from '../model/Socket';

const fsPromises = fs.promises;

export class BlockchainManager {
  public publishMessage = async (messagePayload, transactionType) => {
    try {
      const blockChain = new Blockchain();
      let newBlock;
      const messageList = await blockChain.getAllBlocks();

      if (!messageList || !messageList.length) {
        newBlock = blockChain.createBlock(messagePayload);
      } else {
        newBlock = blockChain.createBlock(
          messagePayload,
          blockChain.getLatestBlock(messageList).hash,
          transactionType
        );
      }
      // publish block to all
      await this.publishBlock('groupchat', { uuid: uuid(), block: newBlock });
      emit('customEmit', 'Published to Network');
      return { blockDetails: newBlock };
    } catch (err) {
      throw err;
    }
  };

  private publishBlock = async (name, newBlock) => {
    try {
      const publisher = new Publish();
      await publisher.publishBlock(name, newBlock);
      return true;
    } catch (err) {
      throw err;
    }
  };

  public validateAndAckBlock = async block => {
    /* block = {
      uuid: '351b3bd7-5e96-4156-b049-adc9d4cf5917',
      block: {
        previousHash:
          '2f39dbc8d33ac3b691b1921633f4572bf0838b4f7aecc6faecc68e51356052df',
        timestamp: 1582914600000,
        transactions: {
          sender: 'sabari',
          title: 'Group Chat',
          message: 'Hi',
          sentOn: '2020-02-29T17:18:17.209Z'
        },
        nonce: 0,
        hash:
          '335b8c813272234f1632191bea4784f974539f916c3d539545b2c16177536656',
        transactionType: ''
      }
    }; */
    try {
      const blockChain = new Blockchain();
      let isChainValid = false;
      let isSmartContractExecuted = true;
      const messageList = await blockChain.getAllBlocks();

      if (!messageList || !messageList.length) {
        await this.publishBlock('ackChat', { isValid: true, ...block });
        emit('customEmit', 'Acknowledged the block');
      } else {
        messageList.push(block.block);
        isChainValid = blockChain.isChainValid(messageList);

        if (
          block.block.transactionType ===
          TransactionTypes.SmartContractExecution
        ) {
          isSmartContractExecuted = await this.executeSmartContract(
            block.block.transactions,
            false
          );
        }

        // If chain is not valid that means ledger data is tampered.
        if (!isChainValid) {
          emit(
            'customEmit',
            'Validation Failed, Data might be Tampered. Initiating data request'
          );
          await fsPromises.writeFile(
            __dirname + '/../../info.txt',
            JSON.stringify([])
          );
          new Publish().publishBlock('newMember', {
            apiURL: `http://${ip.address()}:${
              global['port']
            }/blockchain/receive`,
            httpMethod: 'POST'
          });
        }

        if (isChainValid && isSmartContractExecuted) {
          await this.publishBlock('ackChat', {
            isValid: isChainValid,
            ...block
          });
        }
      }
    } catch (err) {
      throw err;
    }
  };

  public addBlock = async blockData => {
    /* blockData = {
      isValid: true,
      uuid: 'e0c10832-d422-4f33-a762-5240a246dceb',
      block: {
        previousHash:
          '2f39dbc8d33ac3b691b1921633f4572bf0838b4f7aecc6faecc68e51356052df',
        timestamp: 1582914600000,
        transactions: {
          sender: 'sabari',
          title: 'Group Chat',
          message: 'Hi',
          sentOn: '2020-02-29T17:21:02.050Z'
        },
        nonce: 0,
        hash:
          '91612d89f7de25847033d1ede6b894d3d89d00ca6b4da00aca9df8f7d0464685',
        transactionType: ''
      }
    }; */
    try {
      const blockChain = new Blockchain();
      if (blockData.isValid) {
        let ackBlocks: any = await fsPromises.readFile(
          __dirname + '/../../ackBlock.txt',
          'utf8'
        );

        ackBlocks = ackBlocks ? JSON.parse(ackBlocks) : {};
        ackBlocks[blockData.uuid] = parseInt(ackBlocks[blockData.uuid], 10);
        ackBlocks[blockData.uuid] = ackBlocks[blockData.uuid]
          ? ackBlocks[blockData.uuid] + 1
          : 1;

        if (ackBlocks[blockData.uuid] === 2) {
          let messageList = await blockChain.getAllBlocks();

          if (!messageList || !messageList.length) {
            messageList = [blockData.block];
          } else {
            messageList.push(blockData.block);
          }

          emit('customEmit', 'Writing to ledger');
          await blockChain.saveBlocks(messageList);

          if (
            blockData.block.transactionType ===
            TransactionTypes.SmartContractExecution
          ) {
            await this.executeSmartContract(blockData.block.transactions, true);
          }
          emit('refresh', '');
        }

        await fsPromises.writeFile(
          __dirname + '/../../ackBlock.txt',
          JSON.stringify(ackBlocks, null, 2)
        );
      } else {
        emit(
          'customEmit',
          'Not a valid transaction acknowledgement by peers ignoring the block'
        );
      }
      return true;
    } catch (err) {
      throw err;
    }
  };

  public initiateChain = async () => {
    try {
      const blockChain = new Blockchain();
      const genesisBlock = blockChain.createGenesisBlock();
      await fsPromises.writeFile(
        __dirname + '/../../info.txt',
        JSON.stringify([genesisBlock], null, 2)
      );
      await fsPromises.writeFile(
        __dirname + '/../../ackBlock.txt',
        JSON.stringify({}, null, 2)
      );
      return true;
    } catch (err) {
      throw err;
    }
  };

  public GetAllMessages = async () => {
    try {
      const data = await fsPromises.readFile(__dirname + '/../../info.txt');
      return data.toString('utf8');
    } catch (error) {
      throw error;
    }
  };

  public sendBlockchain = async apiDetails => {
    try {
      const data = await fsPromises.readFile(__dirname + '/../../info.txt');
      const blockChain = data.toString('utf8');
      rp({
        method: apiDetails.httpMethod,
        uri: apiDetails.apiURL,
        body: { blockChain },
        json: true
      })
        .then(res => {
          // console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    } catch (error) {
      throw error;
    }
  };

  public validateAndReplaceChain = async reqBlockChain => {
    try {
      const blockChain = new Blockchain();
      let isChainValid = false;
      const data = await fsPromises.readFile(__dirname + '/../../info.txt');
      const myBlockChain = JSON.parse(data.toString('utf8'));
      if (reqBlockChain.length > myBlockChain.length) {
        isChainValid = blockChain.isChainValid(reqBlockChain);
        if (isChainValid) {
          emit('customEmit', 'Writing to ledger');
          await fsPromises.writeFile(
            __dirname + '/../../info.txt',
            JSON.stringify(reqBlockChain, null, 2)
          );
          emit('refresh', '');
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  public executeSmartContract = async (payload, persistState) => {
    try {
      const { smartContractAddress, methodToCall, methodParams } = payload;

      let ledgerData: any = await fsPromises.readFile(
        __dirname + '/../../info.txt',
        'utf8'
      );
      ledgerData = ledgerData ? JSON.parse(ledgerData) : [];

      const contract = ledgerData.find(
        elem => elem.hash === smartContractAddress
      ).transactions;
      const uuidVal = uuid();
      await fsPromises.writeFile(
        __dirname + `/../../${uuidVal}.js`,
        contract.contractDetails
      );

      let smartContractState: any = await fsPromises.readFile(
        __dirname + '/../../smartContractState.txt',
        'utf8'
      );
      smartContractState = smartContractState
        ? JSON.parse(smartContractState)
        : {};

      const SmartContract = require(__dirname + `/../../${uuidVal}.js`);
      const smartContract = new SmartContract(
        smartContractState[smartContractAddress]
      );
      const result = smartContract[methodToCall](methodParams);

      if (persistState) {
        smartContractState[smartContractAddress] = smartContract.getState();
        await fsPromises.writeFile(
          __dirname + '/../../smartContractState.txt',
          JSON.stringify(smartContractState, null, 2)
        );
      } else {
        emit('customEmit', JSON.stringify(result, null, 2));
      }

      return result.status;
    } catch (err) {
      throw err;
    }
  };
}
