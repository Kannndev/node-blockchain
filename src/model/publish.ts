export class Publish {
  public publishBlock(block) {
    try {
      global['channel'].assertExchange('groupchat', 'fanout', {
        durable: false
      });
      return global['channel'].publish('groupchat', '', new Buffer(JSON.stringify(block)));
    } catch (err) {
      console.log(err);
    }
  }
}
