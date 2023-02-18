const{ categoryService } = require("../services/category.service")

function CategoryController() {
    this.categoryService = categoryService
}
CategoryController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

CategoryController.prototype.getCategories = async function(user) {
    const store = this.getStore(user)
    return this.categoryService.getCategories(store)
}

CategoryController.prototype.getCategory = async function(categoryId, user) {
    const store = this.getStore(user)
    return this.categoryService.getCategory(categoryId, store.id)
}

CategoryController.prototype.saveCategory = async function(category, user) {
    const store = this.getStore(user)
    category.store = store
    return this.categoryService.saveCategory(category)
}

CategoryController.prototype.updateCategory = async function(category, user) {
    const store = this.getStore(user)
    category.store = store
    return this.categoryService.updateCategory(category)
}

CategoryController.prototype.deleteCategory = async function(category, user) {
    const store = this.getStore(user)
    category.store = store
    return this.categoryService.deleteCategory(category)
}

const categoryController = new (CategoryController)
module.exports = { categoryController } 
