export class Publish {
  public publishBlock(block) {
    return global['channel'].sendToQueue(
      global['queueName'],
      new Buffer(JSON.stringify(block))
    );
  }
}
