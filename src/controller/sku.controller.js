const{ skuService } = require("../services/sku.service")

function SkuController() {
    this.skuService = skuService
}
SkuController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

SkuController.prototype.getSkus = async function(user) {
    const store = this.getStore(user)
    return this.skuService.getSkus(store)
}

SkuController.prototype.getSku = async function(skuId, user) {
    const store = this.getStore(user)
    return this.skuService.getSku(skuId, store.id)
}

SkuController.prototype.saveSku = async function(sku, user) {
    const store = this.getStore(user)
    sku.store = store
    return this.skuService.saveSku(sku)
}

SkuController.prototype.updateSku = async function(sku, user) {
    const store = this.getStore(user)
    sku.store = store
    return this.skuService.updateSku(sku)
}

SkuController.prototype.deleteSku = async function(sku, user) {
    const store = this.getStore(user)
    sku.store = store
    return this.skuService.deleteSku(sku)
}

const skuController = new (SkuController )
module.exports = { skuController } 

