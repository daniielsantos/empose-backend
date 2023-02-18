const{ db } = require("../services/db.service")
const format = require("pg-format")
const os = require("os")
var http = require('http');

function UploadsRepository(){
    this.db = db
}
let ipAddr
const getLocalIp = function() {
    let inter
    if(process.platform == 'win32')
        inter = os.networkInterfaces().Ethernet.find(it => it.family == 'IPv4')
    if(process.platform == 'linux')
        inter = os.networkInterfaces().wlan0.find(it => it.family == 'IPv4')
    console.log("My local IP: ", inter.address)
    ipAddr = '177.96.119.231:'+ process.env.SERVER_PORT + '/'
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            if(ip)
                ipAddr = ip + ':' + process.env.SERVER_PORT + '/'
          console.log("My public IP: " + ip);
        });
    });
}()

UploadsRepository.prototype.getUploads = async function(storeId) {
    const query = `SELECT u.id, u.name, '${ipAddr}' || u.path as path, u.created_at, u.updated_at
    FROM uploads u
    WHERE u.store_id = $1
    `
    return this.db.query(query, [storeId])     
}

UploadsRepository.prototype.getUpload = async function(uploadId, storeId) {
    const query = `SELECT u.id, u.name, '${ipAddr}' || u.path as path, u.created_at, u.updated_at
    FROM uploads u
    WHERE u.id = $1
    AND u.store_id = $2
    `
    return this.db.query(query, [uploadId, storeId])    
}

UploadsRepository.prototype.saveUpload = async function(uploads) {
    let payload = {
        name: uploads.name,
        path: uploads.path,
        store_id: uploads.store.id,
        created_at: uploads.created_at
    }
    const query = format(`INSERT INTO uploads("name", "path", "store_id", "created_at") VALUES (%L) RETURNING *`, Object.values(payload)) 
    return this.db.query(query)
}

UploadsRepository.prototype.updateUpload = async function(uploads) {
    let payload = {
        id: uploads.id,
        name: uploads.name,
        path: uploads.path,
        updated_at: uploads.updated_at,
    }
    const query = `UPDATE uploads SET "name" = $2, "path" = $3, "updated_at" = $4 WHERE id = $1 RETURNING *`
    return this.db.query(query, Object.values(payload))
}

UploadsRepository.prototype.deleteUpload = async function(uploads) {
    const query = `DELETE 
    FROM uploads u
    WHERE u.id = $1
    `
    return this.db.query(query, [uploads.id])   
}

const uploadsRepository = new UploadsRepository
module.exports = { uploadsRepository }
