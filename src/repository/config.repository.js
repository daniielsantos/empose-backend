const{ db } = require("../services/db.service")
const format = require("pg-format")

function ConfigRepository(){
    this.db = db
}

ConfigRepository.prototype.getConfig = async function(storeId) {
    const query = `SELECT c.id, c.email_host, c.email_port, c.email_username, c.email_password
    FROM configs c
    WHERE c.store_id = $1
    `
    return this.db.query(query, [storeId])    
}

ConfigRepository.prototype.saveConfig = async function(config) {
    const payload = {
        email_host: config.email_host,
        email_port: config.email_port,
        email_username: config.email_username,
        email_password: config.email_password,
        store_id: config.store.id
    }
    const query = format(`INSERT INTO configs("email_host", "email_port", "email_username", "email_password", "store_id") VALUES (%L) RETURNING *`, Object.values(payload)) 
    return this.db.query(query)
}

ConfigRepository.prototype.updateConfig = async function(config) {
    const payload = {
        id: config.id,
        email_host: config.email_host,
        email_port: config.email_port,
        email_username: config.email_username,
        email_password: config.email_password
    }
    const query = `UPDATE configs SET "email_host" = $2, "email_port" = $3, "email_username" = $4, "email_password" = $5 WHERE id = $1 RETURNING *`
    return this.db.query(query, Object.values(payload))
}

ConfigRepository.prototype.deleteConfig = async function(config) {
    const query = `DELETE 
    FROM configs c
    WHERE c.id = $1
    `
    return this.db.query(query, [config.id])      
}
const configRepository = new ConfigRepository
module.exports = { configRepository }
