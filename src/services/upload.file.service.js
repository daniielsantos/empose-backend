const path = require("path")
const fs = require("fs")
const formidable = require("formidable")
const { uploadsService } = require("./uploads.service")

function UploadFileService() { 
    this.uploadsService = uploadsService
}

UploadFileService.prototype.getStore = function(user) {
    const store = {
        id: user.store_id
    }
    return store
}

UploadFileService.prototype.saveFile = async function(store, fileName, filePath) {
    let uploadFile = {
        name: fileName,
        path: filePath,
        store: store,
    }
    return this.uploadsService.saveUpload(uploadFile)
}

UploadFileService.prototype.uploadFile = async function(req, res) {
    try {
        let fileName, filePath
        const store = this.getStore(req.user)
        const form = new formidable.IncomingForm();
        let uploadPath = path.resolve('./src/uploads') +'\/'

        await new Promise((resolve, reject) => {
            form.parse(req, function (err, fields, files) {
                const oldpath = files.file.filepath;
                fileName = files.file.originalFilename
                filePath = 'uploads' + '\/' + fileName
                const newpath = uploadPath + fileName
                if (err) reject('error');
                fs.rename(oldpath, newpath, function (err) {
                    if (err) reject('error');
                    resolve('done')
                });
            })
        })

        let fileSaved = await this.saveFile(store, fileName, filePath)
        res.send(fileSaved)
    } catch (e) {
        throw new Error("falha ao fazer upload "+e.message)
    }
}


const uploadFileService = new (UploadFileService)
module.exports = { uploadFileService }
