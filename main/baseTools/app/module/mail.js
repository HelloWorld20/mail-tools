/**
 * [nodemailer 邮件下发模块]
 * @type {[type]}
 */
"use strict"
const nodemailer  = require("nodemailer");
const fs = require('fs');

const core = require('../lib/core.js');

function sendMail( config, callback ) {

    let user = config.from,
        pass = config.pass,
        mailFrom = config.mailFrom,
        to = config.mailTo,
        subject = config.subject,
        file = config.mailHtml


    let html = fs.readFileSync(file, {});

    let smtpTransport = nodemailer.createTransport("SMTP", {
        service: "QQ",        //暂时只支持QQ邮箱，如果要支持其他服务器，请Google：nodemailer，查看文档说明。
        auth: {
            user: user,
            pass: pass
        }
    });

    smtpTransport.sendMail({
        from    : mailFrom ? mailFrom + '<' + user + '>' : user + '<' + user + '>',
        to      : to,
        subject : subject || 'Node.JS通过SMTP协议从QQ邮箱发送邮件',
        html    : html
    }, function(err, res) {
        console.log(err, res);
    }); 

    if( core.isFunction(callback) ) callback();
}

module.exports = ( config, callback ) => {
    sendMail( config, callback )
};
