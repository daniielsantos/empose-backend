const bcrypt = require('bcrypt')

function Crypt() { /* TODO */ }

Crypt.prototype.hash = async function(password) {
    return bcrypt.hash(password, 10);
}

Crypt.prototype.compare = async function(password, hash) {
    return bcrypt.compare(password, hash)
}
const crypt = new (Crypt)
module.exports = {
    crypt
}
