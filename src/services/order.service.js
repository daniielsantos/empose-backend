const { orderRepository } = require("../repository/order.repository")
const { clientService } = require("./client.service")
const { paymentMethodService } = require("./payment.method.service")
const { skuService } = require("./sku.service")
const { skuInventoryService } = require("./sku.inventory.service")
const { productService } = require("./product.service")



function OrderService() {
    this.orderRepository = orderRepository
    this.clientService = clientService
    this.paymentMethodService = paymentMethodService
    this.skuService = skuService
    this.skuInventoryService = skuInventoryService
    this.productService = productService
}

OrderService.prototype.processOrder = async function(order) {
    let i = 0
    let total = 0
    
    for await (const it of order.items) {
        let sk = await this.skuService.getSku(it.id, order.store.id)
        let prod = await this.productService.getProduct(sk.product.id, order.store.id)
        let priceWithDiscount = sk.price - (sk.price * prod.discount)
        order.items[i].sku = sk
        total += (parseFloat(priceWithDiscount.toString()) * it.quantity)
        i++
    }
    // atualizar inventario
    for await (const it of order.items) {
        let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
        if(it.quantity > invInventory.quantity) {
            throw new Error(`Sku id: ${it.id} sem estoque!`)
        }
        invInventory.quantity = invInventory.quantity - it.quantity
        await this.skuInventoryService.updateSkuInventory(invInventory)
    }

    order.total = total
    return order
}

OrderService.prototype.checkAndUpdateOrderItemsInventory = async function(order, newOrder) {
    for await (const it of order.items) {
        let res = newOrder.items.find(i => i.id == it.id)
        if(res && res.quantity != it.quantity) {
            let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
            if(res.quantity > invInventory.quantity) {
                throw new Error(`Sku id: ${it.id} sem estoque!`)
            }
        }
    }
    for await (const it of newOrder.items) {
        let res = order.items.find(i => i.id == it.id)
        if(!res) {
            let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
            if(it.quantity > invInventory.quantity) {
                throw new Error(`Sku id: ${it.id} sem estoque!`)
            }
        }
    }
    await this.hasDeletedItem(order, newOrder)
    //new items in the order
    for await (const it of newOrder.items) {
        let res = order.items.find(i => i.id == it.id)
        if(!res) {
            let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
            invInventory.quantity = invInventory.quantity - it.quantity
            await this.skuInventoryService.updateSkuInventory(invInventory)
        }
    }
    //update keept items that change quantity
    for await (const it of order.items) {
        let res = newOrder.items.find(i => i.id == it.id)
        if(res && res.quantity != it.quantity) {
            let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
            invInventory.quantity = invInventory.quantity - it.quantity
            await this.skuInventoryService.updateSkuInventory(invInventory)
        }
    }
}

OrderService.prototype.hasDeletedItem = async function(order, newOrder) {
    let deletedItems = []
    for await (const it of order.items) {
        let res = newOrder.items.find(i => i.id == it.id)
        if(!res) {
            deletedItems.push(it)
            let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
            invInventory.quantity = invInventory.quantity + it.quantity
            await this.skuInventoryService.updateSkuInventory(invInventory)
        }
    }
    return deletedItems
}

OrderService.prototype.updateInventory = async function(order, subtract, newOrder) {
    if(subtract) {
        await this.checkAndUpdateOrderItemsInventory(order, newOrder)
    } else {
        for await (const it of order.items) {
            let invInventory = await this.skuInventoryService.getSkuInventory(it.id, order.store.id)
            invInventory.quantity = invInventory.quantity + it.quantity
            await this.skuInventoryService.updateSkuInventory(invInventory)
        }
    }
}


OrderService.prototype.orderInventoryUpdate = async function(order) {
    let ord = await this.getOrder(order.id, order.store.id)
    if(!order.canceled && ord.status == order.status && ord.delivery_status == order.delivery_status) {
        await this.updateInventory(ord, true, order)
    } else if(order.canceled && ord.status == order.status && ord.delivery_status == order.delivery_status){
        await this.updateInventory(order, false)
    }
}


OrderService.prototype.getErros = async function(order) {
    let res = await this.clientService.getClient(order.client.id, order.store.id)
    if(!res)
        throw new Error("cliente do pedido nao encontrado")
    res = await this.paymentMethodService.getPaymentMethod(order.payment.id, order.store.id)
    if(!res)
        throw new Error("metodo de pagamento do pedido nao encontrado")
    if(!order.items)
        throw new Error("pedido sem produto")
}

OrderService.prototype.getOrders = async function(store) {
    try {
        const result = await this.orderRepository.getOrders(store.id)
        return result.rows
    } catch(e) {
        throw new Error(e.message)
    }
}

OrderService.prototype.getOrder = async function(orderId, storeId) {
    try {
        const result = await this.orderRepository.getOrder(orderId, storeId)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

OrderService.prototype.saveOrder = async function(order) {
    try {
        order.created_at = new Date
        await this.getErros(order)
        let ord = await this.processOrder(order)
        let result = await this.orderRepository.saveOrder(ord)
        return result
    } catch(e) {
        console.log("erro ", e.message)
        throw new Error(e.message)
    }
}

OrderService.prototype.updateOrder = async function(order) {
    try {
        order.updated_at = new Date        
        let pay = await this.getOrder(order.id, order.store.id)
        
        if(!pay)
            throw new Error("pedido nao encontrado")
        
        await this.getErros(order)
        await this.orderInventoryUpdate(order)
        const result = await this.orderRepository.updateOrder(order)
        return result
    } catch(e) {
        throw new Error(e.message)
    }
}

OrderService.prototype.deleteOrder = async function(order) {
    try {
        let pay = await this.getOrder(order.id, order.store.id)
        if(!pay)
            throw new Error("pedido nao encontrado")
        await this.orderRepository.deleteOrder(order)
        return { message: "pedido deletado" }
    } catch(e) {
        throw new Error(e.message)
    }
}

const orderService = new (OrderService)
module.exports = { orderService }
