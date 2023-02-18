const{ storeService } = require("../services/store.service")

function StoreController() {
    this.storeService = storeService
}

StoreController.prototype.getStores = async function()  {
    return this.storeService.getStores()
}
StoreController.prototype.getStore = async function(storeId) {
    return this.storeService.getStore(storeId)
}

StoreController.prototype.saveStore = async function(store) {
    return this.storeService.saveStore(store)
}

StoreController.prototype.updateStore = async function(store) {
    return this.storeService.updateStore(store)
}

StoreController.prototype.deleteStore = async function(store) {
    return this.storeService.deleteStore(store)
}

const storeController = new (StoreController)
module.exports = { storeController } 
