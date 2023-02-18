const{ db } = require("../services/db.service")
const format = require("pg-format")
const { crypt } = require("../services/bcrypt.service")

function UsersRepository(){
    this.db = db
    this.bcrypt = crypt
}

UsersRepository.prototype.getUserByEmail = async function(user) {
    const query = `SELECT u.id, u.name, u.email, u.password, u.role, u.created_at, u.updated_at,
    json_strip_nulls(json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'cnpj', c.cnpj, 'address', c.address)) AS store
    FROM Users u 
    LEFT JOIN store c ON c.id = u.store_id
    WHERE u.email = $1
    GROUP BY 
    u.id,
    u.email,
    u.password,
    u.role,
    u.created_at,
    u.updated_at,
    c.id,
    c.name,
    c.email,
    c.cnpj,
    c.address
    `
    
    return this.db.query(query, [user.email])
}

UsersRepository.prototype.getUser = async function(userId, storeId) {
    const query = `SELECT u.id, u.name, u.email, u.password, u.role, u.created_at, u.updated_at 
    FROM Users u WHERE id = $1
    AND u.store_id = $2
    `
    return this.db.query(query, [userId, storeId])
}

UsersRepository.prototype.getUsers = async function(storeId) {
    const query = `SELECT u.id, u.name, u.email, u.password, u.role, u.created_at, u.updated_at 
    FROM Users u 
    WHERE store_id = $1`
    return this.db.query(query, [storeId])
}

UsersRepository.prototype.saveUser = async function(user) {
    if(!user.role)
        user.role = "ADMIN"

    const payload = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        store_id: user.store.id,
        createdAt: new Date
    }
    
    const query = format(`INSERT INTO Users(name, email, password, role, store_id, created_at) VALUES (%L) RETURNING *`, Object.values(payload)) 
    return this.db.query(query)
}

UsersRepository.prototype.updateUser = async function(user) {
    let res = await this.getUser(user.id, user.store.id)
    let usr = res.rows[0]
    delete usr.created_at
    usr.updated_at = user.updated_at || new Date
    if(user.name != usr.name)
        usr.name = user.name
    if(user.email != usr.email)
        usr.email = user.email
    if(user.password != usr.password)
        usr.password = await this.bcrypt.hash(user.password)         
    if(user.role != usr.role)
        usr.role = user.role
    const query = `UPDATE users SET "name" = $2, "email" = $3, "password" = $4, "role" = $5, "updated_at" = $6 WHERE id = $1 RETURNING *`
    const pay = await this.db.query(query, Object.values(usr))
    return pay
}

UsersRepository.prototype.deleteUser = async function(user) {
    const query = `DELETE 
    FROM users u
    WHERE u.id = $1
    `
    return this.db.query(query, [user.id])  
}

const userRepository = new (UsersRepository)
module.exports = { userRepository }
