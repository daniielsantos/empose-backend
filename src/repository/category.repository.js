const{ db } = require("../services/db.service")
const format = require("pg-format")

function CategoryRepository(){
    this.db = db
}

CategoryRepository.prototype.getCategories = async function(storeId) {
    const query = `SELECT c.id, c.name, c.description, c.created_at, c.updated_at
    FROM category c
    WHERE c.store_id = $1
    `
    return this.db.query(query, [storeId])    
}

CategoryRepository.prototype.getCategory = async function(categoryId, storeId) {
    const query = `SELECT c.id, c.name, c.description, c.created_at, c.updated_at
    FROM category c
    WHERE c.id = $1
    AND c.store_id = $2
    `
    return this.db.query(query, [categoryId, storeId])    
}

CategoryRepository.prototype.saveCategory = async function(category) {
    const payload = {
        name: category.name,
        description: category.description,
        store_id: category.store.id,
        created_at: category.created_at
    }
    const query = format(`INSERT INTO category("name", "description", "store_id", "created_at") VALUES (%L) RETURNING *`, Object.values(payload)) 
    return this.db.query(query)
}

CategoryRepository.prototype.updateCategory = async function(category) {
    const payload = {
        id: category.id,
        name: category.name,
        description: category.description,
        updated_at: category.updated_at
    }    
    const query = `UPDATE category SET "name" = $2, "description" = $3, "updated_at" = $4 WHERE id = $1 RETURNING *`
    return this.db.query(query, Object.values(payload))
}

CategoryRepository.prototype.deleteCategory = async function(category) {
    const query = `DELETE 
    FROM category c
    WHERE c.id = $1
    `
    return this.db.query(query, [category.id])     
}
const categoryRepository = new CategoryRepository
module.exports = { categoryRepository }
