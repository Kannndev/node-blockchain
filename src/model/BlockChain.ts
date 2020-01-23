import { Block } from './index';
import * as fs from 'fs';
const fsPromises = fs.promises;

export class Blockchain {
  /**
   * @returns {Block}
   */
  public createBlock(message, previousHash = '') {
    return new Block(
      Date.parse(new Date().toDateString()),
      message,
      previousHash
    );
  }

  public getLatestBlock(chain) {
    return chain[chain.length - 1];
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
      JSON.stringify(blockList)
    );
  }

  public isChainValid(chain) {
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
    }
    return true;
  }
}
