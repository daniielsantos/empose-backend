const{ productService } = require("../services/product.service")

function ProductController() {
    this.productService = productService
}
ProductController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

ProductController.prototype.getProducts = async function(user) {
    const store = this.getStore(user)
    return this.productService.getProducts(store)
}

ProductController.prototype.getProduct = async function(productId, user) {
    const store = this.getStore(user)
    return this.productService.getProduct(productId, store.id)
}

ProductController.prototype.saveProduct = async function(product, user) {
    const store = this.getStore(user)
    product.store = store
    return this.productService.saveProduct(product)
}

ProductController.prototype.updateProduct = async function(product, user) {
    const store = this.getStore(user)
    product.store = store    
    return this.productService.updateProduct(product)
}

ProductController.prototype.deleteProduct = async function(product, user) {
    const store = this.getStore(user)
    product.store = store
    return this.productService.deleteProduct(product)
}

const productController = new (ProductController )
module.exports = { productController } 

