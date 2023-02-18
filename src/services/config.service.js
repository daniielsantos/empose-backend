const{ configRepository } = require("../repository/config.repository")

function ConfigsService() {
    this.configRepository = configRepository
}


ConfigsService.prototype.getConfig = async function(storeId) {
    try {
        const result = await this.configRepository.getConfig(storeId)        
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

ConfigsService.prototype.saveConfig = async function(config) {
    try {
        const result = await this.configRepository.saveConfig(config)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

ConfigsService.prototype.updateConfig = async function(config) {
    try {
        let pay = await this.getConfig(config.store.id)
        if(!pay)
            throw new Error("config nao encontrado")
        const result = await this.configRepository.updateConfig(config)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

ConfigsService.prototype.deleteConfig = async function(config) {
    try {
        let pay = await this.getConfig(config.store.id)
        if(!pay)
            throw new Error("config nao encontrado")
        await this.configRepository.deleteConfig(config)
        return {message: "config deletada"}
    } catch(e) {
        throw new Error(e.message)
    }
}

const configsService = new (ConfigsService)
module.exports = { configsService }
