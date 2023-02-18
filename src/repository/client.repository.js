const{ db } = require("../services/db.service")
const format = require("pg-format")

function ClientRepository(){
    this.db = db
}

ClientRepository.prototype.getClients = async function(storeId) {
    const query = `SELECT c.id, c.name, c.email, c.cpf, c.phone_number, c.created_at, c.updated_at,    
    json_strip_nulls(json_agg(json_build_object('id', ca.id, 'address', ca.address, 'city', ca.city, 'state', ca.state, 'zip_code', ca.zip_code, 'country', ca.country))) AS address
    FROM client c
    LEFT JOIN client_address ca ON ca.client_id = c.id
    WHERE c.store_id = $1
    GROUP BY 
    c.id,
    c.name,
    c.email,
    c.cpf,
    c.phone_number,
    c.created_at,
    c.updated_at
    `
    return this.db.query(query, [storeId])     
}

ClientRepository.prototype.getClient = async function(clientId, storeId) {
    const query = `SELECT c.id, c.name, c.email, c.cpf, c.phone_number, c.created_at, c.updated_at, 
    json_strip_nulls(json_agg(json_build_object('id', ca.id, 'address', ca.address, 'city', ca.city, 'state', ca.state, 'zip_code', ca.zip_code, 'country', ca.country))) AS address
    FROM client c
    LEFT JOIN client_address ca ON ca.client_id = c.id
    WHERE c.id = $1
    AND c.store_id = $2
    GROUP BY 
    c.id,
    c.name,
    c.email,
    c.cpf,
    c.phone_number,
    c.created_at,
    c.updated_at
    `
    return this.db.query(query, [clientId, storeId])  
}

ClientRepository.prototype.saveClient = async function(client) {
    const addresses = new Array
    const payload = {
        name: client.name,
        email: client.email,
        cpf: client.cpf,
        phone_number: client.phone_number,
        created_at: client.created_at,
        store_id: client.store.id
    }
    const query = format(`INSERT INTO Client("name", "email", "cpf", "phone_number", "created_at", "store_id") VALUES (%L) RETURNING *`, Object.values(payload)) 
    const cli = await this.db.query(query)
    client.address.forEach(item => {
        let pld = {
            id: cli.rows[0].id,
            address: item.address,
            city: item.city,
            state: item.state,
            zip_code: item.zip_code,
            country: item.country,
            created_at: new Date,
            store_id: cli.rows[0].store_id
        }
        addresses.push(Object.values(pld))
    })
    const addrs = format(`INSERT INTO client_address("client_id","address","city","state","zip_code", "country", "created_at", "store_id") VALUES %L RETURNING *;`, addresses)
    const result = await this.db.query(addrs)
    let clientSaved = {...cli.rows[0]}
    clientSaved.address = result.rows
    return clientSaved
}

ClientRepository.prototype.updateClient = async function(client) {
    const addresses = new Array
    const address = client.address || []
    const payload = {
        id: client.id,
        name: client.name,
        email: client.email,
        cpf: client.cpf,
        phone_number: client.phone_number,
        updated_at: client.updated_at
    }
    
    const query = `UPDATE Client SET "name" = $2, "email" = $3, "cpf" = $4, "phone_number" = $5, "updated_at" = $6 WHERE id = $1 RETURNING *`
    const cli = await this.db.query(query, Object.values(payload))
    address.forEach(item => {
        let pld = {
            id: cli.rows[0].id,
            address: item.address,
            city: item.city,
            state: item.state,
            zip_code: item.zip_code,
            country: item.country,
            created_at: item.created_at || new Date,
            updated_at: new Date,
            store_id: cli.rows[0].store_id
        }
        addresses.push(Object.values(pld))
    })
    const del_addrs = `DELETE FROM client_address WHERE client_id = $1`
    await this.db.query(del_addrs, [client.id])
    const addrs = format(`INSERT INTO client_address("client_id", "address", "city", "state", "zip_code", "country", "created_at", "updated_at", "store_id") VALUES %L RETURNING *`, addresses)
    const result = await this.db.query(addrs)
    let clientSaved = {...cli.rows[0]}
    clientSaved.address = result.rows
    return clientSaved
}

ClientRepository.prototype.deleteClient = async function(client) {
    const query = `DELETE 
    FROM client c
    WHERE c.id = $1
    `
    return this.db.query(query, [client.id])    
}
const clientRepository = new ClientRepository
module.exports = { clientRepository }
