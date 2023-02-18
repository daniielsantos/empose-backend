const{ db } = require("../services/db.service")
const format = require("pg-format")
const{ skuRepository } = require("./sku.repository")

function ProductRepository(){
    this.db = db
    this.skuRepository = skuRepository
}

ProductRepository.prototype.getProducts = async function(storeId) {
    const query = `SELECT p.id, p.name, p.description, p.active, p.discount, p.created_at, p.updated_at, 
    json_strip_nulls(json_build_object('id', ca.id, 'name', ca.name, 'description', ca.description)) AS category,
    json_strip_nulls(json_agg(json_build_object('id', s.id, 'name', s.name, 'description', s.description, 'active', s.active, 'price', s.price, 'created_at', s.created_at, 'updated_at', s.updated_at))) AS skus
    FROM Product p
    LEFT JOIN category ca ON p.category_id = ca.id
    LEFT JOIN sku s ON s.product_id = p.id
    WHERE p.store_id = $1
    GROUP BY 
    p.id,
    p.name,
    p.description,
    p.active,
    p.discount,
    p.created_at,
    p.updated_at,
    ca.id
    `
    return this.db.query(query, [storeId])     
}

ProductRepository.prototype.getProduct = async function(productId, storeId) {
    const query = `SELECT p.id, p.name, p.description, p.active, p.discount, p.created_at, p.updated_at,
    json_strip_nulls(json_build_object('id', ca.id, 'name', ca.name, 'description', ca.description)) AS category,
    json_strip_nulls(json_agg(json_build_object('id', s.id, 'name', s.name, 'description', s.description, 'active', s.active, 'price', s.price, 'created_at', s.created_at, 'updated_at', s.updated_at))) AS skus
    FROM Product p
    LEFT JOIN category ca ON p.category_id = ca.id
    LEFT JOIN sku s ON s.product_id = p.id
    WHERE p.id = $1
    AND p.store_id = $2
    GROUP BY 
    p.id,
    p.name,
    p.description,
    p.active,
    p.discount,
    p.created_at,
    p.updated_at,
    ca.id
    `
    return this.db.query(query, [productId, storeId])    
}

ProductRepository.prototype.saveProduct = async function(product) {
    const payload = {
        name: product.name,
        description: product.description,
        active: product.active,
        discount: product.discount,
        category_id: product.category.id,
        store_id: product.store.id,
        created_at: product.created_at,
    }
    
    const query = format(`INSERT INTO Product("name", "description", "active", "discount", "category_id", "store_id", "created_at") VALUES (%L) RETURNING *`, Object.values(payload)) 
    const prod = await this.db.query(query)
    for await (let it of product.skus) {
        it.store = product.store
        it.product = prod.rows[0]
        it.created_at = new Date
        await this.skuRepository.saveSku(it)
    }
    return prod.rows[0]
}

ProductRepository.prototype.updateProduct = async function(product) {
    const payload = {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        discount: product.discount,
        category_id: product.category.id,
        store_id: product.store.id,
        updated_at: product.updated_at,
    }
    
    const query = `UPDATE Product SET "name" = $2, "description" = $3, "active" = $4, "discount" = $5, "category_id" = $6, "store_id" = $7, "updated_at" = $8 WHERE id = $1 RETURNING *`
    let res = await this.db.query(query, Object.values(payload))
    
    if(product.skus) {
        for await (let it of product.skus) {
            it.store = product.store
            it.product = product
            await this.skuRepository.saveSkuIfNotExist(it)
            await this.skuRepository.updateSku(it)
        }
    }
    return res.rows[0]
}

ProductRepository.prototype.deleteProduct = async function(product) {
    const query = `DELETE 
    FROM product p
    WHERE p.id = $1
    `
    return this.db.query(query, [product.id])    
}
const productRepository = new ProductRepository
module.exports = { productRepository }
