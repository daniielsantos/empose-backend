const os = require("os")
var http = require('http');

function ServerIp() { /* TODO */ }

ServerIp.prototype.getIp = async function() {
    ipAddr = '127.0.0.1:'+ process.env.SERVER_PORT + '/'
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            if(ip)
                ipAddr = ip + ':' + process.env.SERVER_PORT + '/'
            console.log('ip ', ip)
        });
    });
    return ipAddr
}

const serverIp = new (ServerIp)
module.exports = {
    serverIp
}
