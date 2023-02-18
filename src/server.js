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
    configController
    )

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
