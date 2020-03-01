module.exports = class AssetTracker {
  constructor({ assetStore = [], assetHolders = {} }) {
    this.assetStore = assetStore;
    /*
      [{
          name: 'Iphone',
        uuid: 1
      }, {
          name: 'Samsung',
        uuid: 2
      }, {
          name: 'Mi',
        uuid: 3
      }]
      */
    this.assetHolders = assetHolders;
    /*
      {
        1 : 'John',
        2 : 'Roshan',
        3 : 'Sabari'
      }
      */
  }

  transferAsset({ from, to, assetId }) {
    if (this.assetStore.findIndex(elem => elem.uuid === assetId) === -1) {
      return {
        status: false,
        message: 'No asset found for the given id'
      };
    }

    if (this.assetHolders[assetId] !== from) {
      return {
        status: false,
        message: 'Sender is not the owner of asset'
      };
    }

    this.assetHolders[assetId] = to;
    return {
      status: true,
      message: 'Asset owner updated'
    };
  }

  getState() {
    return {
      assetStore: this.assetStore,
      assetHolders: this.assetHolders
    };
  }
};
