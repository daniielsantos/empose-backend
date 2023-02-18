const{ skuRepository } = require("../repository/sku.repository")
const{ productService } = require("./product.service")




function SkuService() {
    this.skuRepository = skuRepository
    this.productService = productService
}

SkuService.prototype.getSkus = async function(store) {
    try {
        const result = await this.skuRepository.getSkus(store.id)
        return result.rows
    } catch(e) {
        throw new Error(e.message)
    }
}

SkuService.prototype.getSku = async function(skuId, storeId) {
    try {
        const result = await this.skuRepository.getSku(skuId, storeId)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

SkuService.prototype.saveSku = async function(sku) {
    try {
        sku.created_at = new Date
        let prod = await this.productService.getProduct(sku.product.id, sku.store.id)
        if(!prod)
            throw new Error("produto nao encontrado: insira um produto")
        const result = await this.skuRepository.saveSku(sku)
        return result
    } catch(e) {
        throw new Error(e.message)
    }
}

SkuService.prototype.updateSku = async function(sku) {
    try {
        let sk = await this.getSku(sku.id, sku.store.id)
        if(!sk)
            throw new Error("sku nao encontrado")
        sku.updated_at = new Date
        sku.product = sk.product        
        const result = await this.skuRepository.updateSku(sku)
        return result
    } catch(e) {
        throw new Error(e.message)
    }
}

SkuService.prototype.deleteSku = async function(sku) {
    try {
        let pay = await this.getSku(sku.id, sku.store.id)
        if(!pay)
            throw new Error("sku nao encontrado")
        await this.skuRepository.deleteSku(sku)
        return { message: "sku deletado" }
    } catch(e) {
        throw new Error(e.message)
    }
}

const skuService = new (SkuService)
module.exports = { skuService }
