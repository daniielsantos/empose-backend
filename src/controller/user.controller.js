const{ userService } = require("../services/user.service")

function UserController() {
    this.userService = userService
}

UserController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

UserController.prototype.userLogin = async function(user) {
    const result = await this.userService.userLogin(user)
    if(!result)
        throw new Error("Usuario ou senha invalidos")
    return result
}

UserController.prototype.accountRecovery = async function(user) {
    const result = await this.userService.accountRecovery(user)
    return result
}

UserController.prototype.getUser = async function(userId, usr) {
    let store = this.getStore(usr)
    return this.userService.getUser(userId, store.id)
}

UserController.prototype.getUsers = async function(user) {
    const store = this.getStore(user)
    return this.userService.getUsers(store)
}

UserController.prototype.saveRegister = async function(user) {
    return this.userService.saveRegister(user)
}

UserController.prototype.saveUser = async function(user) {
    return this.userService.saveUser(user)
}

UserController.prototype.updateUser = async function(user, usr) {
    const store = this.getStore(usr)
    user.store = store
    return this.userService.updateUser(user)
}

UserController.prototype.deleteUser = async function(user, usr) {
    const store = this.getStore(usr)
    user.store = store
    return this.userService.deleteUser(user)
}


const userController = new (UserController)
module.exports = { userController } 

