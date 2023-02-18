const{ paymentMethodService } = require("../services/payment.method.service")

function PaymentMethodController() {
    this.paymentMethodService = paymentMethodService
}

PaymentMethodController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

PaymentMethodController.prototype.getPaymentMethods = async function(user) {
    const store = this.getStore(user)
    return this.paymentMethodService.getPaymentMethods(store)
}

PaymentMethodController.prototype.getPaymentMethod = async function(paymentId, user) {
    const store = this.getStore(user)
    return this.paymentMethodService.getPaymentMethod(paymentId, store.id)
}

PaymentMethodController.prototype.savePaymentMethod = async function(paymentMethod, user) {
    const store = this.getStore(user)
    paymentMethod.store = store
    return this.paymentMethodService.savePaymentMethod(paymentMethod)
}

PaymentMethodController.prototype.updatePaymentMethod = async function(paymentMethod, user) {
    const store = this.getStore(user)
    paymentMethod.store = store
    return this.paymentMethodService.updatePaymentMethod(paymentMethod)
}

PaymentMethodController.prototype.deletePaymentMethod = async function(paymentMethod, user) {
    const store = this.getStore(user)
    paymentMethod.store = store
    return this.paymentMethodService.deletePaymentMethod(paymentMethod)
}

const paymentMethodController = new (PaymentMethodController)
module.exports = { paymentMethodController } 

