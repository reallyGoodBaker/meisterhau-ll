// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/>

const mail = require("./File").mail;

const auto = {
    delExpireAutoMail() {
        setInterval(() => {
            let auto_sent_mail = mail.getAutoSentMail();
            let mail_id = Object.keys(auto_sent_mail);
            mail_id.forEach((mail_id) => {
                let auto_mail = auto_sent_mail[mail_id];
                if (auto_mail.deadline > 0) {
                    let interval = (new Date(system.getTimeStr()).getTime() - new Date(auto_mail.time).getTime()) / (1000 * 60 * 60 * 24);
                    if (Math.ceil(auto_mail.deadline - interval) <= 0)
                        mail.delAutoSentMail(mail_id);
                };
            });
        }, 1000);
    }
};

module.exports = auto;