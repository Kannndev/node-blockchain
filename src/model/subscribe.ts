export class Subscribe {
  public subscribeBlock() {
    global['channel'].consume(
      global['queueName'],
      msg => {
        console.log('Message Received:', msg.content.toString());
      },
      { noAck: true }
    );
  }
}
