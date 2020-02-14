import { UserManager } from '../managers';

export class Subscribe {
  public subscribeBlock() {
    global['channel'].assertExchange('groupchat', 'fanout', { durable: false });
    global['channel'].assertQueue('', { exclusive: true }, (err, q) => {
      global['channel'].bindQueue(q.queue, 'groupchat', '');
      global['channel'].consume(
        q.queue,
        msg => {
          console.log('Message Received: ', msg.content.toString());
          const userManager = new UserManager();
          userManager.validateAndAckBlock(JSON.parse(msg.content.toString()));
        },
        { noAck: true }
      );
    });
  }

  public subscribeBlockAck() {
    global['channel'].assertExchange('ackChat', 'fanout', { durable: false });
    global['channel'].assertQueue('', { exclusive: true }, (err, q) => {
      global['channel'].bindQueue(q.queue, 'ackChat', '');
      global['channel'].consume(
        q.queue,
        msg => {
          console.log('Message Ack: ', msg.content.toString());
          const userManager = new UserManager();
          userManager.addBlock(JSON.parse(msg.content.toString()));
        },
        { noAck: true }
      );
    });
  }

  public subscribeNewMember() {
    try {
      global['channel'].assertExchange('newMember', 'fanout', {
        durable: false
      });
      global['channel'].assertQueue('', { exclusive: true }, (err, q) => {
        global['channel'].bindQueue(q.queue, 'newMember', '');
        global['channel'].consume(
          q.queue,
          msg => {
            console.log('New member: ', msg.content.toString());
            const userManager = new UserManager();
            userManager.sendBlockchain(JSON.parse(msg.content.toString()));
          },
          { noAck: true }
        );
      });
    } catch (err) {
      console.log(err);
    }
  }
}
