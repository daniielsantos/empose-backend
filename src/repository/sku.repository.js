const{ db } = require("../services/db.service")
const format = require("pg-format")
const { skuInventoryRepository } = require("./sku.inventory")
const os = require("os")
var http = require('http');

function SkuRepository(){
    this.db = db
    this.skuInventoryRepository = skuInventoryRepository
}
let ipAddr
const getLocalIp = function() {
    if(!process.env.SERVER_DDNS) {
        http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
            resp.on('data', function(ip) {
                if(ip)
                    ipAddr = ip + ':' + process.env.SERVER_PORT + '/'
              console.log("My public IP: " + ip);
            });
        });
        return
    }
    ipAddr = process.env.SERVER_DDNS + ':' + process.env.SERVER_PORT + '/'
}()

SkuRepository.prototype.getSkus = async function(storeId) {
    const query = `SELECT s.id, s.name, s.description, s.active, s.price, s.created_at, s.updated_at,
    json_strip_nulls(json_build_object('id', p.id)) AS product,
    json_strip_nulls(json_agg(json_build_object('id', si.id, 'path', '${ipAddr}' || si.path, 'name', si.name, 'created_at', si.created_at, 'updated_at', si.updated_at))) AS images
    FROM sku s
    LEFT JOIN product p ON p.id = s.product_id
    LEFT JOIN sku_image si ON si.sku_id = s.id
    LEFT JOIN sku_inventory i ON i.sku_id = s.id
    WHERE s.store_id = $1
    GROUP BY 
    s.id,
    s.name,
    s.description,
    s.active,
    s.price,
    s.created_at,
    s.updated_at,
    i.id,
    p.id
    `
    return this.db.query(query, [storeId])    
}

SkuRepository.prototype.getSku = async function(skuId, storeId) {
    const query = `SELECT s.id, s.name, s.description, s.active, s.price, s.created_at, s.updated_at,    
    json_strip_nulls(json_build_object('id', p.id)) AS product,
    json_strip_nulls(json_agg(json_build_object('id', si.id, 'path', '${ipAddr}' || si.path, 'name', si.name, 'created_at', si.created_at, 'updated_at', si.updated_at))) AS images
    FROM sku s
    LEFT JOIN product p ON p.id = s.product_id
    LEFT JOIN sku_image si ON si.sku_id = s.id
    WHERE s.id = $1
    AND s.store_id = $2
    GROUP BY 
    s.id,
    s.name,
    s.description,
    s.active,
    s.price,
    s.created_at,
    s.updated_at,
    p.id
    `
    return this.db.query(query, [skuId, storeId])      
}

SkuRepository.prototype.saveSku = async function(sku) {
    const skus = new Array
    const payload = {
        name: sku.name,
        description: sku.description,
        active: sku.active,
        price: sku.price,
        product_id: sku.product.id,
        store_id: sku.store.id,
        created_at: sku.created_at
    }
    const query = format(`INSERT INTO Sku("name", "description", "active", "price", "product_id", "store_id", "created_at") VALUES (%L) RETURNING *`, Object.values(payload)) 
    const sk = await this.db.query(query)

    let skuInventory = {
        quantity: 0,
        sku_id: sk.rows[0].id,
        store_id: sku.store.id,
        created_at: sku.created_at
    }
    
    await this.skuInventoryRepository.saveSkuInventory(skuInventory)

    if(!sku.images)
        return sk.rows[0]
    sku.images.forEach(item => {
        let img = {
            id: sk.rows[0].id,
            name: item.name,
            path: item.path,
            created_at: new Date,
            store_id: sk.rows[0].store_id
        }
        skus.push(Object.values(img))
    })
    const imagesQuery = format(`INSERT INTO sku_image("sku_id","name","path", "created_at", "store_id") VALUES %L RETURNING *;`, skus)
    const result = await this.db.query(imagesQuery)

    let skSaved = {...sk.rows[0]}
    skSaved.images = result.rows
    return skSaved
}

SkuRepository.prototype.updateSku = async function(sku) {
    const skus = new Array
    sku.images = sku.images || []
    const payload = {
        id: sku.id,
        name: sku.name,
        description: sku.description,
        active: sku.active,
        price: sku.price,
        product_id: sku.product.id,
        updated_at: sku.updated_at
    }
    const query = `UPDATE Sku SET "name" = $2, "description" = $3, "active" = $4, "price" = $5, "product_id" = $6, "updated_at" = $7 WHERE id = $1 RETURNING *;`
    const sk = await this.db.query(query, Object.values(payload))
    sku.images.forEach(item => {
        let pld = {
            id: sk.rows[0].id,
            name: item.name,
            path: item.path,
            created_at: new Date,
            store_id: sk.rows[0].store_id
        }
        skus.push(Object.values(pld))
    })
    const del_skus = `DELETE FROM sku_image WHERE sku_id = $1`
    await this.db.query(del_skus, [sku.id])
    if(skus.length){
        const addrs = format(`INSERT INTO sku_image("sku_id","name","path", "created_at", "store_id") VALUES %L RETURNING *;`, skus)
        const result = await this.db.query(addrs)
        let skSaved = {...sk.rows[0]}
        skSaved.images = result.rows
        return skSaved
    } else {
        return sk.rows[0]
    }
}

SkuRepository.prototype.saveSkuIfNotExist = async function(sku) {

    let payload = {
        id: sku.id,
        name: sku.name,
        description: sku.description,
        active: sku.active || true,
        price: sku.price,
        product: sku.product.id,
        store_id: sku.store.id,
        created_at: sku.created_at || new Date
    }
    if(typeof sku.id == 'string') {
        console.log("type string")
        payload.id = 0
    }
    // console.log("sku ", sku)
    let quer = `INSERT INTO sku
                (name, description, active, price, product_id, store_id, created_at) 
                SELECT $2, $3, $4, $5, $6, $7, $8 
                WHERE
                    NOT EXISTS (
                        SELECT id FROM sku WHERE id = $1
                    )
                RETURNING id
                
    `
    let res = await this.db.query(quer, Object.values(payload))
    if(res.rows && res.rows[0]) {
        let skuInventory = {
            quantity: 0,
            sku_id: res.rows[0].id,
            store_id: payload.store.id,
            created_at: payload.created_at
        }        
        await this.skuInventoryRepository.saveSkuInventory(skuInventory)
    }
}
SkuRepository.prototype.deleteSku = async function(sku) {
    const query = `DELETE 
    FROM Sku s
    WHERE s.id = $1
    `
    return this.db.query(query, [sku.id])    
}

SkuRepository.prototype.deleteSkuByProductId = async function(productId) {
    const query = `DELETE 
    FROM Sku s
    WHERE s.product_id = $1
    `
    return this.db.query(query, [productId])    
}
const skuRepository = new SkuRepository
module.exports = { skuRepository }
