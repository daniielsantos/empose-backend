const { uploadsRepository } = require("../repository/uploads.repository")
const fs = require("fs")
const path = require("path")

function UploadsService() {
    this.uploadsRepository = uploadsRepository
}

UploadsService.prototype.getUploads = async function(store) {
    try {
        const result = await this.uploadsRepository.getUploads(store.id)
        return result.rows
    } catch(e) {
        throw new Error(e.message)
    }
}

UploadsService.prototype.getUpload = async function(uploadId, storeId) {
    try {
        const result = await this.uploadsRepository.getUpload(uploadId, storeId)        
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

UploadsService.prototype.saveUpload = async function(uploads) {
    try {
        uploads.created_at = new Date
        const result = await this.uploadsRepository.saveUpload(uploads)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

UploadsService.prototype.updateUpload = async function(uploads) {
    try {
        let upl = await this.getUpload(uploads.id, uploads.store.id)
        const oldPath = path.resolve('./src/uploads/'+upl.name)
        const newPath = path.resolve('./src/uploads/'+uploads.name)
        if(uploads.name != upl.name) {
            fs.rename(oldPath, newPath, () => {
                console.log("arquivo renomeado")
            })
        }
        if(!upl)
            throw new Error("upload nao encontrado")
        uploads.updated_at = new Date
        uploads.path = 'uploads/' + uploads.name
        const result = await this.uploadsRepository.updateUpload(uploads)
        return result.rows[0]
    } catch(e) {
        throw new Error(e.message)
    }
}

UploadsService.prototype.deleteUpload = async function(uploads) {
    try {
        let upl = await this.getUpload(uploads.id, uploads.store.id)
        if(!upl)
            throw new Error("upload nao encontrado")
        await this.uploadsRepository.deleteUpload(uploads)
        const filePath = path.resolve('./src/uploads/'+uploads.name)
        fs.unlink(filePath, (err) => {
            if(err) console.error("arquivo ja deletado")
        })
        return {message: "arquivo upload deletado"}
    } catch(e) {
        throw new Error(e.message)
    }
}

const uploadsService = new (UploadsService)
module.exports = { uploadsService }
