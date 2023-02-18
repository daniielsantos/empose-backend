const{ uploadFileService } = require("../services/upload.file.service")

function UploadFileController() {
    this.uploadFileService = uploadFileService
}

UploadFileController.prototype.uploadFile = async function(req, res) {
    await this.uploadFileService.uploadFile(req, res)
}

const uploadFileController = new (UploadFileController)
module.exports = { uploadFileController } 

