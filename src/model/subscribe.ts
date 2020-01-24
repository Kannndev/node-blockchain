export class Subscribe {
  public subscribeBlock() {
    global['channel'].assertExchange('groupchat', 'fanout', { durable: false });

    global['channel'].assertQueue('', { exclusive: true }, (err, q) => {
      global['channel'].bindQueue(q.queue, 'groupchat', '');
      global['channel'].consume(
        q.queue,
        msg => {
          console.log('Message Received: ', msg.content.toString());
        },
        { noAck: true }
      );
    });

    // global['channel'].consume(
    //   global['queueName'],
    //   msg => {
    //     console.log('Message Received:', msg.content.toString());
    //   },
    //   { noAck: true }
    // );
  }
}
