const{ configsService } = require("../services/config.service")

function ConfigController() {
    this.configsService = configsService
}

ConfigController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

ConfigController.prototype.getConfig = async function(user) {
    const store = this.getStore(user)
    return this.configsService.getConfig(store.id)
}

ConfigController.prototype.saveConfig = async function(config, user) {
    const store = this.getStore(user)
    config.store = store
    return this.configsService.saveConfig(config)
}

ConfigController.prototype.updateConfig = async function(config, user) {
    const store = this.getStore(user)
    config.store = store
    return this.configsService.updateConfig(config)
}

ConfigController.prototype.deleteConfig = async function(config, user) {
    const store = this.getStore(user)
    config.store = store
    return this.configsService.deleteConfig(config)
}

const configController = new (ConfigController)
module.exports = { configController } 

