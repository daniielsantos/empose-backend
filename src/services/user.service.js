const { userRepository } = require("../repository/user.repository")
const { crypt } = require("./bcrypt.service")
const jwt = require("jsonwebtoken")
const { storeService } = require("./store.service")
const { emailSender } = require("./email.service")
const { configsService } = require("./config.service")

function UserService() {
    this.userRepository = userRepository
    this.storeService = storeService
    this.emailSender = emailSender
    this.configsService = configsService
    this.bcrypt = crypt    
}

UserService.prototype.getUserByEmail = async function(user) {
    try {
        const result = await this.userRepository.getUserByEmail(user)
        return result.rows[0]
    } catch(e) {
        throw new Error("falha ao buscar por usuario")
    }
}

UserService.prototype.getUser = async function(userId, storeId) {
    try {
        const result = await this.userRepository.getUser(userId, storeId)
        return result.rows[0]
    } catch(e) {
        throw new Error("falha ao buscar por usuario")
    }
}

UserService.prototype.getUsers = async function(store) {
    try {
        const result = await this.userRepository.getUsers(store.id)
        return result.rows
    } catch(e) {
        throw new Error("falha ao buscar por usuarios")
    }
}

UserService.prototype.userLogin = async function(user) {
    try {        
        const usr = await this.getUserByEmail(user)
        if(!usr)
            throw new Error("usuario nao encontrado")
        
        const isValid = await this.bcrypt.compare(user.password, usr.password)
        
        if(isValid) {
            const payload = {
                email: usr.email,
                name: usr.name,
                store_id: usr.store.id
            }
            const token = jwt.sign(payload, process.env.SECRET)
            delete usr.password
            return { token, user: usr }
        } else {
            throw new Error("usuario ou senha invalidos")
        }
    } catch(e) {
        // console.log(e)
        throw new Error("falha ao autenticar ", e.message)
    }
}

UserService.prototype.accountRecovery = async function(user) {
    try {        
        const usr = await this.getUserByEmail(user)
        if(!usr) 
            throw new Error("Usuario nao encontrado")
        let pwd = Math.random().toString().slice(3, 8)
        usr.password = pwd
        await this.sendRecoveryEmail(usr, 'Empose - Recuperação de Conta')
        await this.userRepository.updateUser(usr)
        return {message: 'Senha de recuperação enviada!'}
    } catch(e) {
        throw new Error("falha ao recuperar conta")
    }
}

UserService.prototype.saveRegister = async function(user) {
    try {
        let store = await this.storeService.saveStore(user.store)
        user.store = store
        const hash = await this.bcrypt.hash(user.password)
        user.password = hash
        const result = await this.userRepository.saveUser(user)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}


UserService.prototype.saveUser = async function(user) {
    try {
        let store = await this.storeService.getStore(user.store.id)
        if(!store)
            throw new Error("loja nao encontrada")
        const usr = await this.getUserByEmail(user)
        if(usr) 
            throw new Error("email em uso")
        if(!user.password) {
            user.password = Math.random().toString().slice(3, 8)
            await this.sendRecoveryEmail(user, "Bem Vindo(a) a Empose")
        }

        const hash = await this.bcrypt.hash(user.password)
        user.password = hash
        const result = await this.userRepository.saveUser(user)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

UserService.prototype.sendRecoveryEmail = async function(user, subject) {
    let config = await this.configsService.getConfig(user.store.id)
    if(!config)
        throw new Error("sistema sem config")
    let options = {
        host: config.email_host,
        port: config.email_port,
        username: config.email_username,
        password: config.email_password,
        from: config.email_username,
        to: user.email,
        template: 'password_recover',
        params: {
            name: user.name,
            password: user.password
        },
        subject: subject
    }
    await this.emailSender.send(options) 
}

UserService.prototype.updateUser = async function(user) {
    try {
        user.updated_at = new Date
        let usr = await this.getUser(user.id, user.store.id)
        if(!usr)
            throw new Error("usuario nao encontrado")
        const result = await this.userRepository.updateUser(user)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

UserService.prototype.deleteUser = async function(user) {
    try {
        let usr = await this.getUser(user.id, user.store.id)
        if(!usr)
            throw new Error("usuario nao encontrado")
        await this.userRepository.deleteUser(user)
        return {message: "usuario deletado"}
    } catch(e) {
        throw new Error(e.message)
    }
}

const userService = new (UserService)
module.exports = { userService }
