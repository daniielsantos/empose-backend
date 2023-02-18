const{ db } = require("../services/db.service")
const format = require("pg-format")

function StoreRepository(){
    this.db = db
}

StoreRepository.prototype.getStores = async function() {
    const query = `SELECT * FROM Store`
    return this.db.query(query)
}

StoreRepository.prototype.getStore = async function(storeId) {
    const query = `SELECT * FROM Store WHERE id = $1`
    return this.db.query(query, [storeId])
}

StoreRepository.prototype.saveStore = async function(store) {
    store.created_at = new Date
    let payload = {
        name: store.name,
        email: store.email,
        cnpj: store.cnpj,
        address: store.address,
        created_at: store.created_at
    }
    const query = format(`INSERT INTO Store(name, email, cnpj, address, created_at) VALUES (%L) RETURNING *`, Object.values(payload)) 
    return this.db.query(query)
}

StoreRepository.prototype.updateStore = async function(store) {
    store.updated_at = new Date
    let payload = {
        id: store.id,
        email: store.email,
        name: store.name,
        cnpj: store.cnpj,
        address: store.address,
        updated_at: store.updated_at
    }
    const query = `UPDATE Store SET "name" = $2, "email" = $3, "cnpj" = $4, "address" = $5, "updated_at" = $6 WHERE id = $1 RETURNING *`
    return this.db.query(query, Object.values(payload))
}

StoreRepository.prototype.deleteStore = async function(store) {
    const query = `DELETE 
    FROM Store c
    WHERE c.id = $1
    `
    return this.db.query(query, [store.id])    
}

const storeRepository = new (StoreRepository)
module.exports = { storeRepository }
