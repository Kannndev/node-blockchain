import { Blockchain, Publish } from '../model';

export class UserManager {
  public publishMessage = async messagePayload => {
    try {
      const blockChain = new Blockchain();
      let newBlock;
      let isChainValid;
      let messageList = await blockChain.getAllBlocks();
      if (!messageList || !messageList.length) {
        isChainValid = true;
        newBlock = blockChain.createBlock(messagePayload);
        messageList = [newBlock];
      } else {
        newBlock = blockChain.createBlock(
          messagePayload,
          blockChain.getLatestBlock(messageList).hash
        );
        messageList.push(newBlock);
        isChainValid = blockChain.isChainValid(messageList);
        if (!isChainValid) {
          throw { error: 'Invalid Block' };
        }
      }
      // publish block to all
      isChainValid = await this.publishBlockAndValidate(newBlock);
      // save valid chain in file
      if (newBlock && isChainValid) {
        await blockChain.saveBlocks(messageList);
      }
      return 'Message Published';
    } catch (err) {
      throw err;
    }
  };

  private publishBlockAndValidate = async (newBlock) => {
    try {
      const publisher = new Publish();
      await publisher.publishBlock(newBlock);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
