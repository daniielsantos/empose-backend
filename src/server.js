require("dotenv").config()
const {makeApp} = require("./app")
const { clientController } = require("./controller/client.controller")
const { storeController } = require("./controller/store.controller")
const { paymentMethodController } = require("./controller/payment.method.controller")
const { userController } = require("./controller/user.controller")
const { categoryController } = require("./controller/category.controller")
const { skuController } = require("./controller/sku.controller")
const { skuInventoryController } = require("./controller/sku.inventory.controller")
const { productController } = require("./controller/product.controller")
const { orderController } = require("./controller/order.controller")
const { emailSenderController } = require("./controller/email.controller")
const { uploadsController } = require("./controller/uploads.controller")
const { uploadFileController } = require("./controller/upload.file.controller")
const { configController } = require("./controller/configs.controller")
const {serverIp} = require("./services/ip.service")


const app = makeApp(
    userController, 
    clientController, 
    storeController, 
    paymentMethodController, 
    categoryController, 
    skuController, 
    skuInventoryController,
    productController,
    orderController,
    emailSenderController,
    uploadsController,
    uploadFileController,
    configController,
    serverIp
    )

app.listen(process.env.SERVER_PORT, () => {
    console.log("Server running on port ", process.env.SERVER_PORT)
})
