const{ emailSender } = require("../services/email.service")

function EmailSenderController() {
    this.emailService = emailSender
}

EmailSenderController.prototype.send = async function(body) {
    return this.emailService.send(body)
}

const emailSenderController = new (EmailSenderController)
module.exports = { emailSenderController } 

