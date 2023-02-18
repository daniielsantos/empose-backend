const{ skuInventoryService } = require("../services/sku.inventory.service")

function SkuInventoryController() {
    this.skuInventoryService = skuInventoryService
}

SkuInventoryController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

SkuInventoryController.prototype.getSkusInventory = async function(user) {
    const store = this.getStore(user)
    return this.skuInventoryService.getSkusInventory(store)
}

SkuInventoryController.prototype.getSkuInventory = async function(skuInventoryId, user) {
    const store = this.getStore(user)
    return this.skuInventoryService.getSkuInventory(skuInventoryId, store.id)
}

SkuInventoryController.prototype.updateSkuInventory = async function(skuInventory, user) {
    const store = this.getStore(user)
    skuInventory.store = store
    return this.skuInventoryService.updateSkuInventory(skuInventory)
}


const skuInventoryController = new (SkuInventoryController)
module.exports = { skuInventoryController } 

