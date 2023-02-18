const{ orderService } = require("../services/order.service")

function OrderController() {
    this.orderService = orderService
}

OrderController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

OrderController.prototype.getOrders = async function(user){
    const store = this.getStore(user)
    return this.orderService.getOrders(store)
}

OrderController.prototype.getOrder = async function(orderId, user) {
    const store = this.getStore(user)
    return this.orderService.getOrder(orderId, store.id)
}

OrderController.prototype.saveOrder = async function(order, user) {
    const store = this.getStore(user)
    order.store = store
    return this.orderService.saveOrder(order)
}

OrderController.prototype.updateOrder = async function(order, user) {
    const store = this.getStore(user)
    order.store = store
    return this.orderService.updateOrder(order)
}

OrderController.prototype.deleteOrder = async function(order, user) {
    const store = this.getStore(user)
    order.store = store
    return this.orderService.deleteOrder(order)
}

const orderController = new (OrderController)
module.exports = { orderController } 

