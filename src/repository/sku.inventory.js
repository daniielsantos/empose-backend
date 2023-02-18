const{ db } = require("../services/db.service")
const format = require("pg-format")

function SkuInventoryRepository(){
    this.db = db
}

SkuInventoryRepository.prototype.getSkusInventory = async function(storeId) {
    const query = `SELECT si.id, si.quantity, si.created_at, si.updated_at,
    json_build_object('id', s.id, 'name', s.name, 'description', s.description) AS sku
    FROM sku_inventory si
    LEFT JOIN sku s ON s.id = si.sku_id
    WHERE si.store_id = $1
    GROUP BY 
    si.id,
    si.quantity,
    si.created_at,
    si.updated_at,
    s.id
    `
    return this.db.query(query, [storeId])      
}

SkuInventoryRepository.prototype.getSkuInventory = async function(skuId, storeId) {
    const query = `SELECT si.id, si.quantity, si.created_at, si.updated_at,
    json_build_object('id', s.id, 'name', s.name, 'description', s.description) AS sku,
    json_build_object('id', st.id) AS store
    FROM sku_inventory si
    LEFT JOIN sku s ON s.id = si.sku_id
    LEFT JOIN store st ON st.id = si.store_id
    WHERE si.sku_id = $1
    AND si.store_id = $2
    GROUP BY 
    si.id,
    si.quantity,
    si.created_at,
    si.updated_at,
    s.id,
    st.id
    `
    return this.db.query(query, [skuId, storeId]) 
}

SkuInventoryRepository.prototype.saveSkuInventory = async function(skuInventory) {
    let inventory = {
        quantity: skuInventory.quantity,
        sku_id: skuInventory.sku_id,
        store_id: skuInventory.store_id,
        created_at: skuInventory.created_at
    }
    const inventoryQuery = format(`INSERT INTO Sku_inventory("quantity", "sku_id", "store_id", "created_at") VALUES (%L) RETURNING *`, Object.values(inventory))
    return this.db.query(inventoryQuery)
}

SkuInventoryRepository.prototype.updateSkuInventory = async function(skuInventory) {
    let payload = {
        sku_id: skuInventory.sku.id,
        store_id: skuInventory.store.id,
        quantity: skuInventory.quantity,
        updated_at: skuInventory.updated_at
    }
    const query = `UPDATE sku_inventory SET "quantity" = $3, "updated_at" = $4 WHERE sku_id = $1 AND store_id = $2 RETURNING id, quantity, sku_id`
    return this.db.query(query, Object.values(payload))
}

const skuInventoryRepository = new SkuInventoryRepository
module.exports = { skuInventoryRepository }
