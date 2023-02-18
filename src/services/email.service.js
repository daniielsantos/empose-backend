const { createTransport } = require('nodemailer')
const hbs = require("nodemailer-express-handlebars")
const path = require("path")
const Handlebars = require("handlebars")

function EmailSender() { 
    // this.hbs = hbs
 }

EmailSender.prototype.send = async function(options) {
    try {
        const transporter = createTransport({
            host: options.host,
            port: options.port,
            auth: {
                user: options.username,
                pass: options.password
            }
        })
        
        this.setTemplateVariable(options.params.name, options.params.password, options.text)

        transporter.use('compile', hbs({
            viewEngine: {
                extname: '.handlebars',
                partialsDir: path.resolve('./src/views/'),
                layoutsDir: path.resolve('./src/views/'),
                defaultLayout: options.template
            },
            viewPath: path.resolve('./src/views/'),
            extName: '.handlebars'
        }))

        let sendOptions = {
            from: options.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments,
            template: options.template //'password_recover' || 'default'
        }
        
        await transporter.sendMail(sendOptions)
        return { message: "email sent" }
    } catch (e) {
        throw new Error(e.message)
    }
}

EmailSender.prototype.setTemplateVariable = function(name = null, password = null, body = null) {
    Handlebars.registerHelper("setVar", function(varName, varValue, opt) {
        switch (varName) {
            case 'name': {
                opt.data.root[varName] = name;
            } break
            case 'password': {
                opt.data.root[varName] = password;
            } break
            case 'body': {
                opt.data.root[varName] = body;
            } break
        }
    });
}
const emailSender = new (EmailSender)
module.exports = { emailSender }
