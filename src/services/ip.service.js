var http = require('http');

function ServerIp() { /* TODO */ }

ServerIp.prototype.getIp = async function() {
    // let ipAddr = '127.0.0.1:'+ process.env.SERVER_PORT + '/'
    const options = {
        hostname: 'api.ipify.org',
        port: 80,
        path: '/',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
    };
    return new Promise(resolve => {
        let req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              ipAddr = chunk
            });
            res.on('end', () => {
              resolve(ipAddr)
            });
        });
        req.end()
    })
}

const serverIp = new (ServerIp)
module.exports = {
    serverIp
}
