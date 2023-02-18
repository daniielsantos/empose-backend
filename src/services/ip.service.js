const os = require("os")
var http = require('http');

function ServerIp() { /* TODO */ }

ServerIp.prototype.getIp = async function() {
    let inter
    if(process.platform == 'win32')
        inter = os.networkInterfaces().Ethernet.find(it => it.family == 'IPv4')
    if(process.platform == 'linux')
        inter = os.networkInterfaces().wlan0.find(it => it.family == 'IPv4')
    
    ipAddr = '177.96.119.231:'+ process.env.SERVER_PORT + '/'
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            if(ip)
                ipAddr = ip + ':' + process.env.SERVER_PORT + '/'
        });
    });
    return ipAddr
}

const serverIp = new (ServerIp)
module.exports = {
    serverIp
}
