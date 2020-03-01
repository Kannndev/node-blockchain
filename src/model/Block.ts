const crypto = require('crypto');
export class Block {
  public previousHash;
  public timestamp;
  public transactions;
  public nonce;
  public hash;
  public transactionType;

  constructor(
    timestamp,
    transactions,
    previousHash = '',
    transactionType = ''
  ) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
    this.transactionType = transactionType;
  }

  /**
   * Returns the SHA256 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  public calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .digest('hex');
  }
}
