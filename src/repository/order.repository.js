const{ db } = require("../services/db.service")
const format = require("pg-format")
const{ skuService } = require("../services/sku.service")

function OrderRepository() {
    this.db = db
    this.skuService = skuService
}

OrderRepository.prototype.getOrders = async function(storeId) {
    const query = `SELECT o.id, o.total, o.status, o.delivery_status, o.canceled, o.created_at, o.updated_at,
    json_strip_nulls(json_build_object('id', pm.id, 'name', pm.name, 'description', pm.description)) AS payment,
    json_strip_nulls(json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'cpf', c.cpf, 'phone_number', c.phone_number)) AS client,
    json_strip_nulls(json_agg(json_build_object('id', s.id, 'name', s.name, 'description', s.description, 'active', s.active, 'price', s.price, 'quantity', oi.quantity))) AS items
    FROM Orders o
    LEFT JOIN payment_method pm ON pm.id = o.payment_method_id
    LEFT JOIN client c ON c.id = o.client_id
    LEFT JOIN order_item oi ON oi.order_id = o.id
    LEFT JOIN sku s ON s.id = oi.sku_id
    WHERE o.store_id = $1
    GROUP BY 
    o.id,
    o.total,
    o.status,
    o.delivery_status,
    o.canceled,
    o.created_at,
    o.updated_at,
    pm.id,
    c.id
    `
    return this.db.query(query, [storeId])  
}

OrderRepository.prototype.getOrder = async function(orderId, storeId) {
    const query = `SELECT o.id, o.total, o.status, o.delivery_status, o.canceled, o.created_at, o.updated_at,
    json_strip_nulls(json_build_object('id', pm.id, 'name', pm.name, 'description', pm.description)) AS payment,
    json_strip_nulls(json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'cpf', c.cpf, 'phone_number', c.phone_number)) AS client,
    json_strip_nulls(json_build_object('id', st.id)) AS store,
    json_strip_nulls(json_agg(json_build_object('id', s.id, 'name', s.name, 'description', s.description, 'active', s.active, 'price', s.price, 'quantity', oi.quantity))) AS items
    FROM Orders o
    LEFT JOIN payment_method pm ON pm.id = o.payment_method_id
    LEFT JOIN client c ON c.id = o.client_id
    LEFT JOIN store st ON st.id = o.store_id
    LEFT JOIN order_item oi ON oi.order_id = o.id
    LEFT JOIN sku s ON s.id = oi.sku_id
    WHERE o.store_id = $2
    AND o.id = $1
    GROUP BY 
    o.id,
    o.total,
    o.status,
    o.delivery_status,
    o.canceled,
    o.created_at,
    o.updated_at,
    pm.id,
    c.id,
    st.id
    `
    return this.db.query(query, [orderId, storeId])   
}

OrderRepository.prototype.saveOrder = async function(order) {
    const items = new Array
    order.canceled = false
    if(!order.status)
        order.status = 1
    if(!order.delivery_status)
        order.status = 1

    const payload = {
        total: order.total,
        status: order.status,
        delivery_status: order.delivery_status,
        payment_method_id: order.payment.id,
        client_id: order.client.id,
        store_id: order.store.id,
        canceled: order.canceled,
        created_at: order.created_at,
    }
    const query = format(`INSERT INTO Orders("total", "status", "delivery_status", "payment_method_id", "client_id", "store_id", "canceled", "created_at") VALUES (%L) RETURNING *`, Object.values(payload)) 
    const ord = await this.db.query(query)
    order.items.forEach(it => {
        let pld = {
            quantity: it.quantity,
            order_id: ord.rows[0].id,
            sku_id: it.sku.id,
            store_id: ord.rows[0].store_id,
            created_at: new Date,
        }
        items.push(Object.values(pld))
    })

    const orderItem = format(`INSERT INTO order_item("quantity", "order_id", "sku_id", "store_id", "created_at") VALUES %L RETURNING *;`, items)
    const result = await this.db.query(orderItem)
    let savedOrder = {...ord.rows[0]}
    savedOrder.items = result.rows
    return savedOrder
}

OrderRepository.prototype.updateOrder = async function(order) {
    const items = new Array
    const payload = {
        id: order.id,
        total: order.total,
        status: order.status,
        delivery_status: order.delivery_status,
        payment_method_id: order.payment.id,
        client_id: order.client.id,
        canceled: order.canceled,
        updated_at: order.updated_at,
    }

    let res = await this.calculateTotal(order)
    payload.total = res.total
    
    const query = `UPDATE Orders SET "total" = $2, "status" = $3, "delivery_status" = $4, "payment_method_id" = $5, "client_id" = $6, "canceled" = $7,"updated_at" = $8 WHERE id = $1 RETURNING *`
    let ord = await this.db.query(query, Object.values(payload))

    res.items.forEach(it => {
        let pld = {
            quantity: it.quantity,
            order_id: ord.rows[0].id,
            sku_id: it.sku.id,
            store_id: ord.rows[0].store_id,
            created_at: new Date,
            updated_at: new Date,
        }
        items.push(Object.values(pld))
    })

    const del_item = `DELETE FROM order_item WHERE order_id = $1`
    await this.db.query(del_item, [order.id])

    const orderItem = format(`INSERT INTO order_item("quantity", "order_id", "sku_id", "store_id", "created_at", "updated_at") VALUES %L RETURNING *;`, items)
    const result = await this.db.query(orderItem)
    let orderSaved = {...ord.rows[0]}
    orderSaved.items = result.rows
    return orderSaved
}

OrderRepository.prototype.deleteOrder = async function(order) {
    const query = `DELETE 
    FROM orders o
    WHERE o.id = $1
    `
    return this.db.query(query, [order.id])   
}

OrderRepository.prototype.calculateTotal = async function(order) {
    let i = 0
    let total = 0.0
    for await (const it of order.items) {
        let sk = await this.skuService.getSku(it.id, order.store.id)
        order.items[i].sku = sk
        total += (parseFloat(sk.price) * it.quantity)
        i++
    }
    order.total = total
    return order
}

const orderRepository = new OrderRepository
module.exports = { orderRepository }
