export class Publish {
  public publishBlock(name, block) {
    try {
      global['channel'].assertExchange(name, 'fanout', {
        durable: false
      });
      return global['channel'].publish(name, '', new Buffer(JSON.stringify(block)));
    } catch (err) {
      console.log(err);
    }
  }
}
