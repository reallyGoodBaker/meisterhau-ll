// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/>

const config = require("./File").config
const nodemailer = require("../lib/nodemailer");

function replace(string, list) {
    string = String(string);
    let varList = string.match(/\{[0-9]{1,20}}/g) || [];
    varList.forEach((varList) => {
        string = string.replaceAll(varList, list[varList]);
    })
    return string.replace(/§[\da-zA-Z]/g, '');
};
function sendmail(to, html, name, names, title, content) {
    content = content.replace(/\n/g, "<br>");
    const emailconfig = config.getEmail();
    const htmls = replace(html, { "{0}": title, "{1}": name, "{2}": names, "{3}": content, "{4}": `https://q.qlogo.cn/g?b=qq&nk=${emailconfig.user}&s=100`, "{5}": config.getInitialMail().server_name })
    if (emailconfig.user != null && emailconfig.user != "114514@qq.com" && emailconfig.pass != null) {
        const transporter = nodemailer.createTransport({
            host: emailconfig.host,
            port: emailconfig.port,
            sercure: emailconfig.sercure,
            auth: {
                user: emailconfig.user,
                pass: emailconfig.pass
            }
        });
        transporter.sendMail({ from: emailconfig.user, to: to, subject: title, html: htmls }, function (err, info) {
            if (err) {
                logger.error(`E-Mail发送失败,收件箱: ${to}`)
                logger.error(info)
            } else { logger.info("E-Mail发送成功") }
        });
    };
};

module.exports = sendmail; 