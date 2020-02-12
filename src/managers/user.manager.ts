import { Blockchain, Publish } from '../model';
import uuid from 'uuid';
import * as fs from 'fs';
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
      } else {
        messageList.push(block.block);
        isChainValid = blockChain.isChainValid(messageList);
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
          await blockChain.saveBlocks(messageList);
        }
        await fsPromises.writeFile(
          __dirname + '/../../ackBlock.txt',
          JSON.stringify(ackBlocks)
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
        JSON.stringify([genesisBlock])
      );
      await fsPromises.writeFile(
        __dirname + '/../../ackBlock.txt',
        JSON.stringify({})
      );
      return true;
    } catch (err) {
      throw err;
    }
  }
}
