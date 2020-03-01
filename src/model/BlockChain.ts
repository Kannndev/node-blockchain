import { Block } from './index';
import * as fs from 'fs';
import { emit } from './Socket';

const fsPromises = fs.promises;

export class Blockchain {
  /**
   * @returns {Block}
   */
  public createBlock(message, previousHash = '', transactionType = '') {
    return new Block(
      Date.parse(new Date().toDateString()),
      message,
      previousHash,
      transactionType
    );
  }

  public getLatestBlock(chain) {
    return chain[chain.length - 1];
  }

  public createGenesisBlock() {
    return new Block('now', {
      sender: 'John',
      title: 'Group Chat',
      message: 'Hi! Everyone',
      sentOn: '2020-02-03'
    });
  }
  public async getAllBlocks() {
    let blocks;
    try {
      blocks = await fsPromises.readFile(__dirname + '/../../info.txt', 'utf8');
      blocks = JSON.parse(blocks);
    } catch (err) {
      blocks = [];
    }
    return blocks;
  }

  public async saveBlocks(blockList) {
    return fsPromises.writeFile(
      __dirname + '/../../info.txt',
      JSON.stringify(blockList, null, 2)
    );
  }

  public isChainValid(chain) {
    emit('customEmit', 'Validating Chain');
    if (chain[0].hash !== this.createGenesisBlock().hash) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      if (
        currentBlock.previousHash !==
        new Block(
          chain[i - 1].timestamp,
          chain[i - 1].transactions,
          chain[i - 1].previousHash
        ).calculateHash()
      ) {
        return false;
      }
      if (
        currentBlock.hash !==
        new Block(
          chain[i].timestamp,
          chain[i].transactions,
          chain[i].previousHash
        ).calculateHash()
      ) {
        return false;
      }
    }
    return true;
  }
}
