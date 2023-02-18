const{ clientService } = require("../services/client.service")

function ClientController() {
    this.clientService = clientService
}
ClientController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

ClientController.prototype.getClients = async function(user) {
    const store = this.getStore(user)
    return this.clientService.getClients(store)
}

ClientController.prototype.getClient = async function(clientId, user) {
    let store = this.getStore(user)
    return this.clientService.getClient(clientId, store.id)
}

ClientController.prototype.saveClient = async function(client, user) {
    const store = this.getStore(user)
    client.store = store
    return this.clientService.saveClient(client)
}

ClientController.prototype.updateClient = async function(client, user) {
    const store = this.getStore(user)
    client.store = store
    return this.clientService.updateClient(client)
}

ClientController.prototype.deleteClient = async function(client, user) {
    const store = this.getStore(user)
    client.store = store
    return this.clientService.deleteClient(client)
}

const clientController = new (ClientController)
module.exports = { clientController } 

