const{ uploadsService } = require("../services/uploads.service")

function UploadsController() {
    this.uploadsService = uploadsService
}

UploadsController.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

UploadsController.prototype.getUploads = async function(user) {
    const store = this.getStore(user)
    return this.uploadsService.getUploads(store)
}

UploadsController.prototype.getUpload = async function(uploadId, user) {
    const store = this.getStore(user)
    return this.uploadsService.getUpload(uploadId, store.id)
}

UploadsController.prototype.saveUpload = async function(uploads, user) {
    const store = this.getStore(user)
    uploads.store = store
    return this.uploadsService.saveUpload(uploads)
}

UploadsController.prototype.updateUpload = async function(uploads, user) {
    const store = this.getStore(user)
    uploads.store = store
    return this.uploadsService.updateUpload(uploads)
}

UploadsController.prototype.deleteUpload = async function(uploads, user) {
    const store = this.getStore(user)
    uploads.store = store
    return this.uploadsService.deleteUpload(uploads)
}

const uploadsController = new (UploadsController)
module.exports = { uploadsController } 

