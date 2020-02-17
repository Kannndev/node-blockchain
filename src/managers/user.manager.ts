import { Blockchain, Publish } from '../model';
import uuid from 'uuid';
import rp from 'request-promise';
import * as fs from 'fs';
import ip from 'ip';
import { emit } from './../model/Socket';

const fsPromises = fs.promises;

export class UserManager {
  public publishMessage = async messagePayload => {
    try {
      const blockChain = new Blockchain();
      let newBlock;
      // let isChainValid;
      const messageList = await blockChain.getAllBlocks();
      if (!messageList || !messageList.length) {
        // isChainValid = true;
        newBlock = blockChain.createBlock(messagePayload);
        // messageList = [newBlock];
      } else {
        newBlock = blockChain.createBlock(
          messagePayload,
          blockChain.getLatestBlock(messageList).hash
        );
        // messageList.push(newBlock);
        // isChainValid = blockChain.isChainValid(messageList);
        // if (!isChainValid) {
        // throw { error: 'Invalid Block' };
        // }
      }
      // publish block to all
      await this.publishBlock('groupchat', { uuid: uuid(), block: newBlock });
      emit('customEmit', 'Published to Network');
      // save valid chain in file
      // if (newBlock && isChainValid) {
      //   await blockChain.saveBlocks(messageList);
      // }
      return 'Message Published';
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
    try {
      const blockChain = new Blockchain();
      let isChainValid = false;
      const messageList = await blockChain.getAllBlocks();
      if (!messageList || !messageList.length) {
        await this.publishBlock('ackChat', { isValid: true, ...block });
        emit('customEmit', 'Acknowledged the block');
      } else {
        messageList.push(block.block);
        isChainValid = blockChain.isChainValid(messageList);
        if (!isChainValid) {
          emit('customEmit', 'Validation Failed, Data might be Tampered. Initiating data request');
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
        await this.publishBlock('ackChat', { isValid: isChainValid, ...block });
      }
    } catch (err) {
      throw err;
    }
  };

  public addBlock = async blockData => {
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
          emit('refresh', '')
        }
        await fsPromises.writeFile(
          __dirname + '/../../ackBlock.txt',
          JSON.stringify(ackBlocks, null, 2)
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
}
