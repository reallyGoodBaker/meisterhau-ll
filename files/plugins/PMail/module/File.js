// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/>

const versions = require("./Info").versions;
const fixvers = require("./Info").fixvers;
const info = require("./Info").info;
const docking = require("./Docking");

const config_data = new JsonConfigFile("./plugins/Planet/PMail/config.json", JSON.stringify({}));
const mail_in_data = new JsonConfigFile(`./plugins/Planet/PMail/data/mail_in.json`, JSON.stringify({}));
const sent_mail_data = new JsonConfigFile(`./plugins/Planet/PMail/data/sent_mail.json`, JSON.stringify({}));
const auto_sent_mail_data = new JsonConfigFile(`./plugins/Planet/PMail/data/auto_sent_mail.json`, JSON.stringify({}));
const email_address_data = new JsonConfigFile(`./plugins/Planet/PMail/data/email_address.json`, JSON.stringify({}));

const config = {
    get(key) {
        config_data.reload()
        if (key == null)
            return JSON.parse(config_data.read());
        else
            return config_data.get(key);
    },
    getVersion() { return config.get().version },
    getScore() { return this.get().score },
    getInitialMail() { return this.get().initial_mail },
    getMailRetention() { return this.get().mail_retention },
    getEmail() { return this.get().email },
    set(object) {
        let key_list = Object.keys(object);
        key_list.forEach((key) => {
            config_data.set(key, object[key]);
        });
    },
    initial() {
        if (fixvers != "") var fix_varsion = `${versions} ${fixvers}`; else var fix_varsion = versions;
        this.set({
            "version": fix_varsion,
            "score": "money",
            "initial_mail": {
                "module": true,
                "server_name": "***服务器",
                "title": "欢迎进入服务器",
                "content": "欢迎来到***服务器(以下称为:本服),请自觉遵守本服游戏规则,切勿开挂等使用辅助工具,祝你游戏愉快\n\n\n---------***服务器",
                "annex": {
                    "module": false,
                    "money": 0,
                    "score": 100,
                    "item": null,
                    "vip": 0
                },
                "received": []
            },
            "mail_retention": 7,
            "email": {
                "module": true,
                "host": "smtp.qq.com",
                "port": 465,
                "sercure": true,
                "user": "114514@qq.com",
                "pass": ""
            }
        })
    },
    update() {
        if (fixvers != "") var fix_varsion = `${versions} ${fixvers}`; else var fix_varsion = versions;
        if (this.getVersion() < fix_varsion) {
            if (this.get("firstemail") != null) {
                let config_ = this.get();
                let key = Object.keys(config_);
                let values = Object.values(config_)
                key.splice(2, 0, "initial_mail")
                key.splice(4, 0, "mail_retention")
                values.splice(2, 0, { module: config_.firstemail.module, server_name: config_.firstemail.servername, title: config_.firstemail.title, content: config_.firstemail.content, annex: config_.firstemail.annex, received: config_.firstemail.received })
                values.splice(4, 0, config_.deadline)
                let newObj = {}
                key.forEach((key, index) => {
                    newObj[key] = values[index]
                })
                delete newObj["regsystem"];
                delete newObj["firstemail"];
                delete newObj["deadline"];
                config_data.write(JSON.stringify(newObj, null, 4))
            }
            if (File.exists("./plugins/Planet/PMail/data/inmailbox.json")) {
                let past_data = JSON.parse(File.readFrom("plugins/Planet/PMail/data/inmailbox.json"))
                File.writeTo("plugins/Planet/PMail/data/mail_in.json", JSON.stringify(past_data, null, 4));
                File.delete("plugins/Planet/PMail/data/inmailbox.json");
            };
            if (File.exists("./plugins/Planet/PMail/data/outmailbox.json")) {
                let past_data = JSON.parse(File.readFrom("plugins/Planet/PMail/data/outmailbox.json"))
                File.writeTo("plugins/Planet/PMail/data/sent_mail.json", JSON.stringify(past_data, null, 4));
                File.delete("plugins/Planet/PMail/data/outmailbox.json");
            };
            if (File.exists("./plugins/Planet/PMail/data/automailbox.json")) {
                let past_data = JSON.parse(File.readFrom("plugins/Planet/PMail/data/automailbox.json"))
                File.writeTo("plugins/Planet/PMail/data/auto_sent_mail.json", JSON.stringify(past_data, null, 4));
                File.delete("plugins/Planet/PMail/data/automailbox.json");
            };
            if (File.exists("./plugins/Planet/PMail/data/emailaddress.json")) {
                let past_data = JSON.parse(File.readFrom("plugins/Planet/PMail/data/emailaddress.json"))
                File.writeTo("plugins/Planet/PMail/data/email_address.json", JSON.stringify(past_data, null, 4));
                File.delete("plugins/Planet/PMail/data/emailaddress.json");
            };
            if (File.exists("./plugins/Planet/PMail/data/sendmail.html")) {
                File.delete("./plugins/Planet/PMail/data/e-mail.html");
                File.rename("./plugins/Planet/PMail/data/sendmail.html", "./plugins/Planet/PMail/data/e-mail.html");
            };
            if (this.getVersion() <= "v2.0.0") {
                let mail_in_box = mail.getMailIn();
                let keys = Object.keys(mail_in_box);
                keys.forEach((key) => {
                    mail_in_box[key].forEach((box) => {
                        if (box.mail_id == null)
                            box.mail_id = box.mailid;
                        if (box.send_time == null)
                            box.send_time = box.sendtime;
                        if (box.return_mail == null)
                            box.return_mail = box.retmail || false;
                        if (box.collect == null)
                            box.collect = false;
                        if (box.annex == null)
                            box.annex = { item: null, money: null, score: null, vip: null };
                        delete box.mailid;
                        delete box.sendtime;
                        delete box.retmail;
                    });
                });
                mail_in_data.write(JSON.stringify(mail_in_box, null, 4));
                let sent_mail_box = mail.getSentMail();
                keys = Object.keys(sent_mail_box);
                keys.forEach((key) => {
                    sent_mail_box[key].forEach((box) => {
                        if (box.mail_id == null)
                            box.mail_id = box.mailid;
                        if (box.send_time == null)
                            box.send_time = box.sendtime;
                        if (box.annex == null)
                            box.annex = { item: null, money: null, score: null, vip: null };
                        delete box.mailid;
                        delete box.sendtime;
                    });
                });
                sent_mail_data.write(JSON.stringify(sent_mail_box, null, 4));
            };
            this.set({ "version": fix_varsion, });
            colorLog("red", "当前配置文件版本与插件版本不匹配,已更新配置文件版本");
        } else if (this.getVersion() > fix_varsion) {
            colorLog("red", "当前配置文件版本高于插件版本插件可能存在问题,请删除config.json重启服务器")
        }
    }
};
const mail = {
    getMailIn(player) {
        mail_in_data.reload();
        if (typeof player == "string") player = { realName: player };
        if (player == null)
            return JSON.parse(mail_in_data.read())
        else
            return mail_in_data.get(player.realName);
    },
    addMailIn(player, mail_id, id, title, content, annex, return_mail) {
        mail_in_data.reload();
        if (typeof player == "string") player = { realName: player };;
        let mail_box = mail.getMailIn(player) || [];
        mail_box.splice(0, 0, {
            mail_id: mail_id || system.randomGuid(),
            id: id,
            title: title,
            content: content,
            collect: false,
            annex: annex,
            read: false,
            send_time: system.getTimeStr(),
            return_mail: return_mail || false,
        });
        if (return_mail)
            return_mail = "退回"
        else
            return_mail = ""
        if (mc.getPlayer(player.realName) != null)
            mc.getPlayer(player.realName).tell(`${info}收到来自${id}${return_mail}的邮件`);
        if (config.getEmail().module)
            mail.sendMail(player, id, title, content.replace(/ /g, "&ensp;"));
        return mail_in_data.set(player.realName, mail_box);
    },
    delMailIn(player, mail_id) {
        mail_in_data.reload();
        if (typeof player == "string") player = { realName: player };
        let mail_box = mail.getMailIn(player) || [];
        mail_box.forEach((mail, index) => {
            if (mail.mail_id == mail_id)
                mail_box.splice(index, 1)
        })
        return mail_in_data.set(player.realName, mail_box);
    },
    modifyMailIn(player, mail_data, type) {
        mail_in_data.reload();
        if (typeof player == "string") player = { realName: player };
        let mail_box = mail.getMailIn(player) || [];
        if (type == "return") {
            mail_data.return_mail = true
            mail_box.forEach((mail, index) => {
                if (mail.mail_id == mail_data.mail_id)
                    mail_box.splice(index, 1, mail_data);
            });
        };
        if (type == "collect") {
            mail_data.collect = true;
            mail_box.forEach((mail, index) => {
                if (mail.mail_id == mail_data.mail_id)
                    mail_box.splice(index, 1, mail_data);
            });
        };
        if (type == "read") {
            mail_data.read = true;
            mail_box.forEach((mail, index) => {
                if (mail.mail_id == mail_data.mail_id)
                    mail_box.splice(index, 1, mail_data);
            });
        };
        return mail_in_data.set(player.realName, mail_box);
    },
    getSentMail(player) {
        sent_mail_data.reload();
        if (typeof player == "string") player = { realName: player };
        if (player == null)
            return JSON.parse(sent_mail_data.read());
        else
            return sent_mail_data.get(player.realName);
    },
    addSentMail(player, mail_id, id, title, content, annex) {
        sent_mail_data.reload();
        if (typeof player == "string") player = { realName: player };
        let mail_box = mail.getSentMail(player) || [];
        mail_box.splice(0, 0, {
            mail_id: mail_id || system.randomGuid(),
            id: id,
            title: title,
            content: content,
            annex: annex,
            send_time: system.getTimeStr()
        });
        return sent_mail_data.set(player.realName, mail_box);
    },
    delSentMail(player, mail_id) {
        sent_mail_data.reload();
        if (typeof player == "string") player = { realName: player };
        let mail_box = mail.getSentMail(player);
        mail_box.forEach((mail, index) => {
            if (mail.mail_id == mail_id)
                mail_box.splice(index, 1)
        })
        return sent_mail_data.set(player.realName, mail_box);
    },
    getAutoSentMail(mail_id) {
        auto_sent_mail_data.reload();
        if (mail_id == null)
            return JSON.parse(auto_sent_mail_data.read());
        else
            return auto_sent_mail_data.get(mail_id);
    },
    addAutoSentMail(id, title, content, annex, deadline) {
        auto_sent_mail_data.reload()
        let mail_id = system.randomGuid();
        let onlineplayer = mc.getOnlinePlayers();
        let received = [];
        onlineplayer.forEach((player) => {
            if (!player.isOP()) {
                mail.addMailIn(player, mail_id, id, title, content, annex);
                received.push(player.realName);
            };
        });
        return auto_sent_mail_data.set(mail_id, { id: id, title: title, content: content, annex, time: system.getTimeStr(), deadline: deadline, received, received })
    },
    delAutoSentMail(mail_id) {
        auto_sent_mail_data.reload()
        if (mail.getAutoSentMail(mail_id) != null)
            return auto_sent_mail_data.delete(mail_id);
        else
            return false;
    },
    setAutoSentMail(mail_id, mail_data) {
        auto_sent_mail_data.reload()
        return auto_sent_mail_data.set(mail_id, mail_data);
    },
    getEmailAddress(player) {
        email_address_data.reload();
        if (typeof player == "string") player = { realName: player };
        if (player == null)
            return JSON.parse(email_address_data.read());
        else
            return email_address_data.get(player.realName);
    },
    setEmailAddress(player, address) {
        email_address_data.reload();
        if (typeof player == "string") player = { realName: player };
        if (address == null)
            return email_address_data.delete(player.realName);
        else
            return email_address_data.set(player.realName, address);
    },
    sendMail(player, id, title, content) {
        if (typeof player == "string") player = { realName: player };
        let email_address = mail.getEmailAddress(player)
        if (email_address == null) {
            if (docking.PLib && docking.PLibVersion >= "v1.1.0") {
                let player_data = docking.PLibBind(player.realName)
                if (player_data != null && player_data.qq != null)
                    email_address = `${player_data.qq}@qq.com`;
            } else if (docking.PLib) {
                let player_data = docking.PLibPlayer(player.realName);
                if (player_data != null && player_data.qqid != null)
                    email_address = `${player_data.qqid}@qq.com`;
            }
        }
        if (email_address != null) {
            require("./Send_email")(email_address, mail.getMailHtml(), player.realName, id, title, content);
            return true;
        } else {
            return false;
        };
    },
    getMailHtml() {
        return File.readFrom(`./plugins/Planet/PMail/data/e-mail.html`)
    },
    initialMailHtml() {
        File.writeTo(`./plugins/Planet/PMail/data/e-mail.html`, `
    <!--这个HTML为模板,你可以在百度上自行搜索、替换、修改
    {0}变量为标题,{1}变量为玩家ID,{2}变量为发送者ID,{3}为邮件内容,{4}为发送者头像(可作为logo使用),{5}为服务器名称(可在PMail/config.json文件中修改)
    --需要你自己对HTML熟悉
    -->
    <div>
    <includetail>
        <div align="center">
            <div class="open_email" style="margin-left: 8px; margin-top: 8px; margin-bottom: 8px; margin-right: 8px;">
                <div>
                    <br>
                    <span class="genEmailContent">
                        <div id="cTMail-Wrap"
                            style="word-break: break-all;box-sizing:border-box;text-align:center;min-width:320px; max-width:660px; border:1px solid #f6f6f6; background-color:#f7f8fa; margin:auto; padding:20px 0 30px; font-family:'helvetica neue',PingFangSC-Light,arial,'hiragino sans gb','microsoft yahei ui','microsoft yahei',simsun,sans-serif">
                            <div class="main-content" style="">
                                <table style="width:100%;font-weight:300;margin-bottom:10px;border-collapse:collapse">
                                    <tbody>
                                        <tr style="font-weight:300">
                                            <td style="width:3%;max-width:30px;"></td>
                                            <td style="max-width:600px;">
                                                <div id="cTMail-logo" style="width:92px; height:25px;">
                                                    <a href="">
                                                    <!--src中填写网络logo,不能用本地logo-->
                                                        <img border="0" src="{4}"
                                                            style="width:110px; height:35px;display:block">
                                                    </a>
                                                </div>
                                                <p
                                                    style="height:2px;background-color: #00a4ff;border: 0;font-size:0;padding:0;width:100%;margin-top:20px;">
                                                </p>
                                                <div id="cTMail-inner"
                                                    style="background-color:#fff; padding:23px 0 20px;box-shadow: 0px 1px 1px 0px rgba(122, 55, 55, 0.2);text-align:left;">
                                                    <table
                                                        style="width:100%;font-weight:300;margin-bottom:10px;border-collapse:collapse;text-align:left;">
                                                        <tbody>
                                                            <tr style="font-weight:300">
                                                                <td style="width:3.2%;max-width:30px;"></td>
                                                                <td style="max-width:480px;text-align:left;">
                                                                    <h1 id="cTMail-title"
                                                                        style="font-size: 20px; line-height: 36px; margin: 0px 0px 22px;">
                                                                        {0}
                                                                    </h1>
                                                                    <p id="cTMail-userName"
                                                                        style="font-size:14px;color:#333; line-height:24px; margin:0;">
                                                                        尊敬的玩家 {1} 您好!<br>
                                                                        这是一封来自 {2} 的邮件
                                                                    </p>
                                                                    <p class="cTMail-content"
                                                                        style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
                                                                        <span
                                                                            style="color: rgb(51, 51, 51); font-size: 14px;">
                                                                            {3}
                                                                        </span>
                                                                    </p>
                                                                    <!-- 下面是按钮
                                                                         <p class="cTMail-content"
                                                                        style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
                                                                        <span
                                                                            style="color: rgb(51, 51, 51); font-size: 14px;">完成注册，请点击下面按钮验证邮箱。
                                                                            <span
                                                                                style="font-weight: bold;">非本人操作可忽略。</span>
                                                                        </span>
                                                                    </p>
                                                                    <p class="cTMail-content"
                                                                        style="font-size: 14px; color: rgb(51, 51, 51); line-height: 24px; margin: 6px 0px 0px; word-wrap: break-word; word-break: break-all;">
                                                                        <a id="cTMail-btn" href="" title=""
                                                                            style="font-size: 16px; line-height: 45px; display: block; background-color: rgb(0, 164, 255); color: rgb(255, 255, 255); text-align: center; text-decoration: none; margin-top: 20px; border-radius: 3px;">
                                                                            点击此处验证邮箱
                                                                        </a>
                                                                    </p>

                                                                      <p class="cTMail-content"
                                                                        style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
                                                                        <span
                                                                            style="color: rgb(51, 51, 51); font-size: 14px;">
                                                                            <br>
                                                                            无法正常显示？请复制以下链接至浏览器打开：
                                                                            <br>
                                                                            <a href="" title=""
                                                                                style="color: rgb(0, 164, 255); text-decoration: none; word-break: break-all; overflow-wrap: normal; font-size: 14px;">
                                                                                这里是激活账号的链接
                                                                            </a>
                                                                        </span>
                                                                    </p> -->
                                                                    <dl
                                                                        style="font-size: 14px; color: rgb(51, 51, 51); line-height: 18px;">
                                                                        <dd
                                                                            style="margin: 0px 0px 6px; padding: 0px; font-size: 12px; line-height: 22px;">
                                                                            <p id="cTMail-sender"
                                                                                style="font-size: 14px; line-height: 26px; word-wrap: break-word; word-break: break-all; margin-top: 32px;">
                                                                                此致
                                                                                <br>
                                                                                <strong>XXX团队</strong>
                                                                            </p>
                                                                        </dd>
                                                                    </dl>
                                                                </td>
                                                                <td style="width:3.2%;max-width:30px;"></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <!-- 下面是二维码什么的
                                                     <div id="cTMail-copy"
                                                    style="text-align:center; font-size:12px; line-height:18px; color:#999">
                                                    <table
                                                        style="width:100%;font-weight:300;margin-bottom:10px;border-collapse:collapse">
                                                        <tbody>
                                                            <tr style="font-weight:300">
                                                                <td style="width:3.2%;max-width:30px;"></td>
                                                                <td style="max-width:540px;">

                                                                    <p
                                                                        style="text-align:center; margin:20px auto 14px auto;font-size:12px;color:#999;">
                                                                        此为系统邮件，请勿回复。
                                                                        <a href=""
                                                                            style="text-decoration:none;word-break:break-all;word-wrap:normal; color: #333;"
                                                                            target="_blank">
                                                                            取消订阅
                                                                        </a>
                                                                    </p>
                                                                    <p id="cTMail-rights"
                                                                        style="max-width: 100%; margin:auto;font-size:12px;color:#999;text-align:center;line-height:22px;">
                                                                        <img border="0"
                                                                            src="http://imgcache.qq.com/open_proj/proj_qcloud_v2/tools/edm/css/img/wechat-qrcode-2x.jpg"
                                                                            style="width:64px; height:64px; margin:0 auto;">
                                                                        <br>
                                                                        <br>
                                                                        <img src="https://imgcache.qq.com/open_proj/proj_qcloud_v2/gateway/mail/cr.svg"
                                                                            style="margin-top: 10px;">
                                                                    </p>
                                                                </td>
                                                                <td style="width:3.2%;max-width:30px;"></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>-->
                                            </td>
                                            <td style="width:3%;max-width:30px;"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </span>
                </div>
            </div>
        </div>
    </includetail>
</div>`)
    }
};

module.exports = { config: config, mail: mail, };