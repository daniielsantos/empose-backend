const { productRepository } = require("../repository/product.repository")
const { categoryService } = require("./category.service")



function ProductService() {
    this.productRepository = productRepository
    this.categoryService = categoryService
}

ProductService.prototype.getProducts = async function(store) {
    try {
        const result = await this.productRepository.getProducts(store.id)
        return result.rows
    } catch(e) {
        throw new Error(e.message)
    }
}

ProductService.prototype.getProduct = async function(productId, storeId) {
    try {
        const result = await this.productRepository.getProduct(productId, storeId)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

ProductService.prototype.saveProduct = async function(product) {
    try {
        product.created_at = new Date
        let cat = await this.categoryService.getCategory(product.category.id, product.store.id)
        if(!cat)
            throw new Error("categoria do produto nao encontrada")

        let result = await this.productRepository.saveProduct(product)
        return result
    } catch(e) {
        throw new Error(e.message)
    }
}

ProductService.prototype.updateProduct = async function(product) {
    try {
        let pay = await this.getProduct(product.id, product.store.id)
        if(!pay)
            throw new Error("produto nao encontrado")
        product.updated_at = new Date
        const result = await this.productRepository.updateProduct(product)
        return result
    } catch(e) {
        throw new Error(e.message)
    }
}

ProductService.prototype.deleteProduct = async function(product) {
    try {
        let pay = await this.getProduct(product.id, product.store.id)
        if(!pay)
            throw new Error("produto nao encontrado")
        await this.productRepository.deleteProduct(product)
        return { message: "produto deletado" }
    } catch(e) {
        throw new Error(e.message)
    }
}

const productService = new (ProductService)
module.exports = { productService }

// exports = ClientService