const { Pool } = require("pg")



function Db() {
    this.pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        max: 20
    })
}

Db.prototype.connect = async function() {
    try {
        this.client = await this.pool.connect()
        return 'Db connected'        
    } catch(e) {
        console.error(e)
        throw new Error('Falha ao connectar ao banco de dados')
    } finally {
        if(this.client)
            this.client.release()
    }
}

Db.prototype.query = async function(query, params) {
    await this.connect()
    return this.client.query(query, params)
}

const db = new (Db)
module.exports = { db }
