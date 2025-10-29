// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/>

const versions = require("./module/Info").versions;
const regvers = require("./module/Info").regvers;
const fixvers = require("./module/Info").fixvers;
const author = require("./module/Info").author
const info = require("./module/Info").info;
const url = require("./module/Info").url;

const config = require("./module/File").config
const mail = require("./module/File").mail;
const auto = require("./module/Auto_oper")
const sendemail = require("./module/Send_email");
const docking = require("./module/Docking");
const Money = require("./module/Money");

const cache = {};
const settime = {};
const system_mail = ["系统", "服务器", "管理员"];
const cmd = {
    register(list) {
        list.forEach((list) => {
            let command = mc.newCommand(list.cmd, list.des, list.per);
            command.setAlias(list.des);
            if (list.cmd == "sendmail") {
                command.optional("code", ParamType.RawText);
                command.overload(["code"]);
            } else
                command.overload([]);
            command.setCallback((cmd_, ori, out, res) => {
                if (list.cmd == "sendmail") {
                    let args = this.analysis(res)
                    if (config.getEmail().module == false) {
                        logger.error("邮件功能尚未开启");
                    } else if (config.getEmail().user == null || config.getEmail().user == "114514@qq.com" || config.getEmail().pass == null) {
                        logger.error("邮件服务器的账号和密码有误,请认真填写");
                    } else if (args[0] == null) {
                        logger.error("请填写要接收的邮箱、玩家ID、QQ号");
                    } else {
                        sendemail(args[0], mail.getMailHtml(), "玩家ID", config.getInitialMail().server_name, config.getInitialMail().title, config.getInitialMail().content);
                    };
                } else if (ori.type == 0) {
                    if (list.cmd == "mail")
                        Player.main(ori.player);
                    else if (list.cmd == "mailset")
                        Player.set_main(ori.player);
                } else if (ori.type == 1) {
                    out.error(`${info}§c请不要在命令方块中使用命令`);
                } else { out.error(`${info}§c请不要在控制台使用命令`) };
            });
            command.setup();
        });
    },
    analysis(_cmd) {
        if (_cmd.code != null) {
            _cmd = _cmd.code.split(" ");
        } else { _cmd = [] };
        return _cmd;
    }
};
const data = {
    isChinese(msg) {
        let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        return reg.test(msg);
    },
    valid_item(item_list) {
        let valid_item = []
        if (docking.PMenu == true) { var menu_item = docking.PMenuItem() } else { var menu_item = "minecraft:clock" }
        item_list.forEach((item, index) => {
            item.index = index;
            if (item.type != null && item.type != menu_item && item.type != "" && item != undefined)
                valid_item.push(item);
        });
        return valid_item;
    },
    item_names(item) {
        if (item.type == "minecraft:name_tag") {
            item = `${item.name}---命名牌`;
        } else if (docking.PLib() && docking.PLibVersion >= "v1.1.0") {
            let item_data = docking.PLibItem(item.type);
            if (item_data != null && item_data.names != null)
                item = item_data.names;
            else
                item = item.name;
        } else if (docking.PLib()) {
            let item_data = docking.PLibItemInfo(item.type);
            if (item_data != null && item_data.names != null)
                item = item_data.chinese;
            else
                item = item.name;
        } else {
            item = item.name
        };
        return item;
    },
    findplayer(name) {
        if (docking.PLib() && docking.PLibVersion >= "v1.1.0") {
            let player_data = docking.PLibBind(name)
            if (player_data != null)
                return true
        } else if (docking.PLib()) {
            let player_data = docking.PLibPlayer(name);
            if (player_data != null)
                return true
        } else { return false };
    },
    bind(key, type) {
        let player_data;
        if (docking.PLib() && docking.PLibVersion() >= "v1.1.0")
            if (key == null)
                player_data = docking.PLibBind();
            else
                player_data = docking.PLibBind(key, type);
        else if (docking.PLib())
            if (key == null)
                player_data = docking.PLibPlayer();
            else
                player_data = docking.PLibPlayer(key);
        return player_data;
    },
    delme(arr, player) {
        arr = arr || []
        arr.forEach((arr_, index) => {
            if (typeof arr_ == "string")
                if (arr_ == player.realName)
                    arr.splice(index, 1);
            if (typeof arr_ == "object")
                if (arr_.name == player.realName || arr_.gameid == player.realName)
                    arr.splice(index, 1);
        });
        return arr;
    },
    search(array, keyword) {
        let regex = new RegExp(keyword, 'i');
        return array.filter((arr) => {
            return arr.match(regex);
        });
    }
};
const Player = {
    main(player) {
        let mail_in_box = mail.getMailIn(player) || [];
        let sent_mail_box = mail.getSentMail(player) || [];
        let email_address = mail.getEmailAddress(player) || "无";
        let fm = mc.newSimpleForm();
        fm.setTitle("邮箱");
        fm.setContent("选择:");
        fm.addButton("新邮件");
        fm.addButton(`收件箱 ${mail_in_box.length}条`);
        fm.addButton(`已发送邮件 ${sent_mail_box.length}条`);
        if (config.getEmail().module)
            fm.addButton(`设置电子邮件接收邮箱\n当前: ${email_address}`)
        else
            fm.addButton(`§c设置电子邮件接收邮箱\n服务器尚未开启电子邮件功能`)
        if (player.isOP() == true) {
            if (docking.PLib()) {
                var newallmail = "发送新邮件给所有玩家"
            } else { var newallmail = "§l§c发送新邮件给所有玩家\n插件未安装" }
            fm.addButton(newallmail);
        }
        player.sendForm(fm, (player, id) => {
            switch (id) {
                case 0: this.send_prompt(player, "people", false);
                    break;
                case 1: this.mail_in_box(player);
                    break;
                case 2: this.sent_mail_box(player)
                    break;
                case 3: this.set_address(player);
                    break;
                case 4:
                    if (docking.PLib())
                        this.send_prompt(player, "all");
                    else {
                        this.main(player);
                        player.tell(`${info}服务器没有安装“PLib”插件,无法发送全部邮件`);
                    }
                    break;
            };
        });
    },
    send_prompt(player, type) {
        if (type == "auto" || type == "all") var content = "\n\n§l§2自动邮件和发送给全部玩家的邮件不会扣除自身的经济、物品"; else var content = ""
        let fm = mc.newSimpleForm();
        fm.setTitle("发送邮件须知");
        fm.setContent("1.请正确填写邮件信息\n2.请文明用语，切勿使用不正当语言\n3.欢迎服主自行编辑\n\n\n\n提示: [附件选项或输入框为非必须]可以发送纯文本邮件,也可以发送带附件的邮件" + content);
        fm.addButton("前往撰写");
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                if (type == "auto")
                    this.set_main(player);
                else
                    this.main(player)
            } else { this.searchplayers(player, type) }
        })
    },
    searchplayers(player, type, array, err, keyword) {
        if (type == "all" || type == "auto")
            this.send_mail(player, type);
        else {
            if (array == null) {
                let fm = mc.newCustomForm();
                fm.setTitle("搜索收件人");
                fm.addInput("填写收件人\n已支持模糊搜索(暂不支持通过QQ号模糊搜索)\n若要使用QQ号,请直接点击提交", "例如: S", keyword || "");
                if (err != null) fm.addLabel(err);
                player.sendForm(fm, (player, id) => {
                    if (id == null) {
                        this.send_prompt(player, type);
                    } else {
                        if (id[0].length > 0) {
                            if (data.isChinese(id[0]))
                                keyword = ["err", "§l§c玩家ID或QQ号可不是中文哟"];
                            else if (!isNaN(id[0]))
                                keyword = ["err", "§l§c不支持纯数字模糊搜索"];
                            else if (id[0] == player.realName)
                                keyword = ["err", "§l§c你不能给自己发邮件"];
                            else {
                                let all_bind = data.delme(data.bind(), player);
                                all_bind.forEach((bind, index) => {
                                    all_bind.splice(index, 1, bind.name || bind.gameid)
                                })
                                keyword = data.search(all_bind, id[0])
                                if (keyword.length == 0)
                                    keyword = ["err", "§l§c没有找到相关的目标玩家"];

                            }
                            if (keyword[0] == "err")
                                this.searchplayers(player, type, null, keyword[1], id[0]);
                            else this.searchplayers(player, type, keyword)
                        }
                        else this.send_mail(player, type);
                    }
                })
            } else {
                let onlineplayers = mc.getOnlinePlayers()
                onlineplayers.forEach((player, index) => {
                    onlineplayers.splice(index, 1, player.realName)
                })
                let fm = mc.newSimpleForm();
                fm.setTitle("选择收件人");
                fm.setContent("选择:");
                array.forEach((arr) => {
                    if (onlineplayers.includes(arr))
                        fm.addButton(`${arr}|§2在线`);
                    else
                        fm.addButton(`${arr}|§7不在线`);
                });
                player.sendForm(fm, (player, id) => {
                    if (id == null) {
                        this.searchplayers(player, type);
                    } else {
                        this.send_mail(player, type, null, null, array[id])
                    }
                })
            }
        }
    },
    send_mail(player, type, reply, err, forplayers, title, content, item, money, score, vip, deadline) {
        let item_list = data.valid_item(player.getInventory().getAllItems())
        let select = ["无"]
        item_list.forEach((item, index) => {
            item.nbt = item.getNbt().toSNBT();
            select.push(data.item_names(item))
        })
        let fm = mc.newCustomForm();
        if (reply == true)
            fm.setTitle(`回复 ${cache[player.realName].title}`);
        else if (type == "auto")
            fm.setTitle("添加自动邮件");
        else
            fm.setTitle("撰写&发送邮件");
        if (!reply)
            if (type == "people")
                fm.addInput("接收人:(玩家ID/QQ号)\n若服务器没有安装“PLib”插件时无法通过QQ号发送邮件", "例如: Steve", forplayers || "");
            else if (type == "auto" || type == "all")
                fm.addDropdown("选择身份", ["管理员", "服务器"], forplayers || 0);
            else;
        else fm.addLabel(`接收人: ${cache[player.realName].id}`);
        fm.addInput("标题：", "例如: 一封邮件", title || "");
        fm.addInput("内容:", "例如: 只因你太美", content || "");
        fm.addDropdown("附件: 物品", select, item || 0);
        fm.addInput(`附件: Money  余额: ${Money.get(player, "money")} 金币`, "本项为选填", money || "");
        fm.addInput(`附件: 计分板  余额: ${Money.get(player, "score")} 金币`, "本项为选填", score || "");
        if (type == "auto" || type == "all")
            fm.addInput(`附件: 会员时长(单位: 天) \n若服务器未安装“PCsvip”插件则该项无效`, "例如: 7", vip || "");
        if (type == "auto") fm.addInput(`自动邮件有效期(单位: 天) \n0为永久, 留空为系统默认: ${config.getMailRetention()} 天`, "例如: 7", deadline || "");
        if (err != null) fm.addLabel(err);
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                this.send_prompt(player, type);
            } else {
                if (type == "people")
                    if (reply == null || !reply)
                        if (id[0].length > 0)
                            if (data.isChinese(id[0]))
                                forplayers = ["err", "§l§c玩家ID或QQ号可不是中文哟"];
                            else if (!isNaN(id[0]))
                                if (docking.PLib()) {
                                    let bind_data = data.bind(id[0])
                                    if (bind_data == null)
                                        forplayers = ["err", "§l§c当前QQ号没有绑定,请通过游戏ID发送邮件"];
                                    else
                                        forplayers = bind_data.name || bind_data.gameid;
                                } else forplayers = ["err", "§l§c当前服务器没有安装“PBind”插件,无法通过QQ号发送邮件"];
                            else if (!data.findplayer(id[0]))
                                forplayers = ["err", "§l§c收件人ID不存在,请检查"];
                            else if (id[0] == player.realName)
                                forplayers = ["err", "§l§c你不能给自己发邮件"];
                            else forplayers = id[0];
                        else forplayers = ["err", "§l§c请正确填写玩家ID或QQ号"];
                    else forplayers = cache[player.realName].id;
                else if (type == "auto" || type == "all")
                    forplayers = "所有玩家";
                if (id[1].length > 0)
                    title = id[1];
                else
                    title = ["err", "§l§c请填写邮件标题"];
                if (id[2].length > 0)
                    content = id[2];
                else
                    content = ["err", "§l§c请填写邮件内容"];
                if (id[3] > 0)
                    item = item_list[id[3] - 1];
                else item = null;
                if (id[4].length > 0)
                    if (!isNaN(id[4]) && id[4] >= 1 && id[4] <= 100000)
                        if (type == "people" && Money.get(player, "money") < id[4])
                            money = ["err", "§l§c你的Money数量不足"];
                        else money = Number(id[4]);
                    else money = ["err", "§l§c请填写附件的Money数量\n1-100000"];
                else money = null;
                if (id[5].length > 0)
                    if (!isNaN(id[5]) && id[5] >= 1 && id[5] <= 100000)
                        if (type == "people" && Money.get(player, "score") < id[4])
                            score = ["err", "§l§c你的计分板数量不足"];
                        else score = Number(id[5]);
                    else score = ["err", "§l§c请填写附件的计分板数量\n1-100000"];
                else score = null;
                if (type == "auto" || type == "all")
                    if (docking.PCsvip) {
                        if (id[6].length > 0)
                            if (!isNaN(id[6]) && id[6] >= 1 && id[6] <= 365)
                                vip = Number(id[6]);
                            else vip = ["err", "§l§c请正确填写附件会员时长(单位: 天)\n1-365"];
                        else vip = null;
                    } else vip = null;
                else vip = null;
                if (type == "auto")
                    if (id[7].length > 0)
                        if (!isNaN(id[7]) && id[7] >= 0 && id[7] <= 365)
                            deadline = Number(id[7]);
                        else deadline = ["err", "§l§c请正确填写自动邮件有效期\n0-365(0为永久,不填为系统默认)"];
                    else deadline = Number(config.getMailRetention());
                else deadline = null;
                let annex_info = "附件:";
                if (item != null)
                    annex_info += `\n     物品--- ${data.item_names(item)}x${item.count}§r`;
                if (money != null)
                    annex_info += `\n     Money--- ${money} 金币`;
                if (score != null)
                    annex_info += `\n     记分板--- ${score} 金币`;
                if (vip != null)
                    annex_info += `\n     会员--- ${vip} 天`;
                if (annex_info == "附件:")
                    annex_info = "";
                if (type == "auto") {
                    var ret_title = "添加确认";
                    var deadlines = `\n自动邮件有效期: ${deadline} 天`
                } else {
                    var ret_title = "发送确认";
                    var deadlines = ""
                };
                if (forplayers[0] == "err")
                    this.send_mail(player, type, reply, forplayers[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else if (title[0] == "err")
                    this.send_mail(player, type, reply, title[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else if (content[0] == "err")
                    this.send_mail(player, type, reply, content[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else if (money != null && money[0] == "err")
                    this.send_mail(player, type, reply, money[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else if (score != null && score[0] == "err")
                    this.send_mail(player, type, reply, score[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else if (type == "all" && vip != null && vip[0] == "err" || type == "auto" && vip != null && vip[0] == "err")
                    this.send_mail(player, type, reply, vip[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else if (type == "auto" && deadline != null && deadline[0] == "err")
                    this.send_mail(player, type, reply, deadline[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                else
                    player.sendModalForm(ret_title, `收件人: ${forplayers} \n邮件标题: ${title} \n邮件内容: ${content}${deadlines} \n\n\n${annex_info} `, "确认", "返回",
                        (player, zid) => {
                            if (zid) {
                                if (type == "people") {
                                    if (item != null) {
                                        player.getInventory().removeItem(item.index, item.count);
                                        player.refreshItems();
                                    }
                                    if (money != null) Money.reduce(player, "money", money);
                                    if (score != null) Money.reduce(player, "score", score); if (reply) delete cache[player.realName];
                                    mail.addMailIn({ realName: forplayers }, null, player.realName, title, `${content} \n\n\n${annex_info} `, { item: item?.nbt, money: money, score: score }, false);
                                    mail.addSentMail(player, null, forplayers, title, `${content} \n\n\n${annex_info} `, { item: item?.nbt, money: money, score: score });
                                    this.send_mail(player, type, null, "§l§2发送成功");
                                } else if (type == "all") {
                                    let all_bind = data.delme(data.bind(), player);
                                    if (id[0])
                                        forplayers = config.getInitialMail().server_name;
                                    else
                                        forplayers = "管理员";
                                    all_bind.forEach((bind) => {
                                        mail.addMailIn({ realName: bind.name } || { realName: bind.gameid }, null, forplayers, title, `${content} \n\n\n${annex_info} `, { item: item?.nbt, money: money, score: score, vip: vip }, false);
                                    })
                                    this.send_mail(player, type, null, "§l§2发送成功");
                                } else if (type == "auto") {
                                    if (id[0])
                                        forplayers = config.getInitialMail().server_name;
                                    else
                                        forplayers = "管理员";
                                    mail.addAutoSentMail(forplayers, title, content, { item: item?.nbt, money: money, score: score }, deadline);
                                    this.send_mail(player, type, reply, "§l§2添加成功", id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                                }
                            } else
                                this.send_mail(player, type, reply, null, id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7]);
                        })
            };
        });
    },
    mail_in_box(player, name) {
        let mail_box;
        if (name == null)
            mail_box = mail.getMailIn(player) || [];
        else
            mail_box = mail.getMailIn(name) || [];
        if (mail_box.length == 0) {
            if (name != null)
                player.sendModalForm(`${name} 的收件箱`, "收件箱是空的", "确认", "关闭",
                    (player, zid) => {
                        if (zid)
                            this.queryplayer_mail_in_box(player)
                        else
                            player.tell(`${info.info} 收件箱是空的`);
                    });
            else
                player.sendModalForm("收件箱", "你的收件箱是空的", "确认", "关闭",
                    (player, zid) => {
                        if (zid)
                            this.main(player);
                        else
                            player.tell(`${info} 你的收件箱是空的`);
                    });
        } else {
            let fm = mc.newSimpleForm();
            if (name == null)
                fm.setTitle("收件箱");
            else
                fm.setTitle(`${name} 的收件箱`);
            fm.setContent("选择:");
            mail_box.forEach((mail_data) => {
                mail_data.annex = mail_data.annex || {}
                if (mail_data.return_mail)
                    mail_data.return_mails = "§l§e退回的邮件§r§8 ";
                if (name == null) {
                    if (mail_data.read)
                        mail_data.reads = "  已读";
                    else
                        mail_data.reads = "  §c未读§8";
                    if (mail_data.annex.item == null && mail_data.annex.money == null && mail_data.annex.score == null && mail_data.annex.vip == null)
                        mail_data.collects = "";
                    else if (mail_data.collect)
                        mail_data.collects = " §l§2★已领取";
                    else
                        mail_data.collects = " §l§2★§c未领取";
                };
                fm.addButton(`${mail_data.return_mails || ""} 发件人: ${mail_data.id}${mail_data.reads || ""} \n时间: ${mail_data.send_time}${mail_data.collects || ""} `)
                delete mail_data.reads;
                delete mail_data.collects;
                delete mail_data.return_mails;
            })
            player.sendForm(fm, (player, id) => {
                if (id == null) {
                    if (name == null)
                        this.main(player);
                    else
                        this.queryplayer_mail_in_box(player)
                } else {
                    this.open_mile(player, name, "mail_in", mail_box[id])
                };
            })
        }
    },
    sent_mail_box(player, name) {
        let mail_box;
        if (name == null)
            mail_box = mail.getSentMail(player) || [];
        else
            mail_box = mail.getSentMail(name) || [];
        if (mail_box.length == 0) {
            if (name != null)
                player.sendModalForm(`${name} 的已发送邮件`, "没有发送过邮件", "确认", "关闭",
                    (player, zid) => {
                        if (zid)
                            this.queryplayer_sent_mail_box(player);
                        else
                            player.tell(`${info.info} 没有发送过邮件`);
                    });
            else
                player.sendModalForm("已发送邮件", "你没有发送过邮件", "确认", "关闭",
                    (player, zid) => {
                        if (zid)
                            this.main(player);
                        else
                            player.tell(`${info} 你没有发送过邮件`);
                    });
        } else {
            let fm = mc.newSimpleForm();
            if (name == null)
                fm.setTitle("收件箱");
            else
                fm.setTitle(`${name} 的收件箱`);
            fm.setContent("选择:");
            mail_box.forEach((mail_data) => {
                fm.addButton(`收件人: ${mail_data.id}\n时间: ${mail_data.send_time}`);
            });
            player.sendForm(fm, (player, id) => {
                if (id == null) {
                    if (name == null)
                        this.main(player);
                    else
                        this.queryplayer_sent_mail_box(player);
                } else {
                    this.open_mile(player, name, "sent_mail", mail_box[id]);
                };
            });
        };
    },
    open_mile(player, name, type, mail_data) {
        mail_data.annex = mail_data.annex || {}
        if (name == null) {
            if (!mail_data.read)
                mail.modifyMailIn(player, mail_data, "read");
            if (system_mail.includes(mail_data.id))
                mail_data.reply = "§l§c回复\n§r§e[系统邮件,无需回复]";
            else
                mail_data.reply = "回复";
            if (mail_data.annex.item == null && mail_data.annex.money == null && mail_data.annex.score == null && mail_data.annex.vip == null)
                mail_data.delmail = "删除邮件";
            else if (mail_data.collect)
                mail_data.delmail = "删除邮件";
            else
                mail_data.delmail = "§l§c附件未领取\n无法删除邮件";
        }
        let fm = mc.newSimpleForm();
        fm.setTitle(`邮件: ${mail_data.title} `)
        if (type == "mail_in")
            fm.setContent(`发件人: ${mail_data.id} \n内容: \n    ${mail_data.content} \n\n\n`);
        if (type == "sent_mail")
            fm.setContent(`收件人: ${mail_data.id} \n内容: \n    ${mail_data.content} \n\n\n`);
        if (name != null || type == "sent_mail") {
            fm.addButton("删除邮件")
        } else {
            fm.addButton(mail_data.reply) // 回复
            fm.addButton(mail_data.delmail) // 删除
            delete mail_data.reply;
            delete mail_data.delmail;
            if (system_mail.includes(mail_data.id))
                fm.addButton("§l§c退回邮件\n§r§e[系统邮件,无法退回]");
            else if (mail_data.collect)
                fm.addButton("§l§c退回邮件\n§r§e[附件物品被你领取了,无法退回]");
            else if (!mail_data.return_mail)
                fm.addButton("退回邮件");
            else
                fm.addButton("§e退回邮件\n这封邮件是对方退回的邮件,无法再次退回");
            if (mail_data.annex.item != null || mail_data.annex.money != null || mail_data.annex.score != null || mail_data.annex.vip != null)
                if (!mail_data.collect)
                    fm.addButton("§2领取附件物品");
        };
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                if (type == "mail_in")
                    this.mail_in_box(player, name);
                if (type == "sent_mail")
                    this.sent_mail_box(player, name);
            } else if (name == null && type == "mail_in") {
                switch (id) {
                    case 0:
                        if (system_mail.includes(mail_data.id)) {
                            this.open_mile(player, name, type, mail_data);
                            player.tell(`${info}系统邮件, 无需回复`);
                        } else {
                            cache[player.realName] = mail_data;
                            this.send_mail(player, "people", true);
                        }
                        break;
                    case 1:
                        if (mail_data.annex.item != null && !mail_data.collect || mail_data.annex.money != null && !mail_data.collect || mail_data.annex.score != null && !mail_data.collect || mail_data.annex.vip != null && !mail_data.collect) {
                            this.open_mile(player, name, type, mail_data);
                            player.tell(`${info}附件还没被领取, 邮件无法删除`);
                        } else {
                            mail.delMailIn(player, mail_data.mail_id);
                            this.mail_in_box(player, name)
                        }
                        break;
                    case 2:
                        if (system_mail.includes(mail_data.id)) {
                            this.open_mile(player, name, type, mail_data);
                            player.tell(`${info}系统邮件, 不能退回`);
                        } else if (mail_data.collect) {
                            this.open_mile(player, name, type, mail_data);
                            player.tell(`${info}附件物品被你领取过了, 不能退回`);
                        } else if (mail_data.return_mail) {
                            this.open_mile(player, name, type, mail_data);
                            player.tell(`${info}这是一封退回来的邮件, 不能再次被退回`);
                        } else {
                            mail.modifyMailIn(player, mail_data, "return")
                            this.mail_in_box(player, name);
                            player.tell(`${info}邮件已退回`);
                        }
                        break;
                    case 3:
                        if (mail_data.annex.item != null) {
                            let item = mc.newItem(NBT.parseSNBT(mail_data.annex.item));
                            let container = player.getInventory();
                            if (container.hasRoomFor(item)) {
                                player.giveItem(item)
                            } else {
                                mc.spawnItem(iteminfo, player.pos);
                                player.sendToast("邮件提醒", `你的物品栏满了, 附件物品已掉落`);
                            };
                        };
                        if (mail_data.annex.money != null)
                            Money.add(player, "money", mail_data.annex.money);
                        if (mail_data.annex.score != null)
                            Money.add(player, "score", mail_data.annex.score);
                        if (mail_data.annex.vip != null && docking.PCsvip)
                            docking.PCsvipAddTime(player, mail_data.annex.vip);
                        mail.modifyMailIn(player, mail_data, "collect");
                        this.open_mile(player, name, type, mail_data);
                        player.tell(`${info}领取成功`);
                        break
                }
            } else {
                if (type == "sent_mail") {
                    if (name == null)
                        mail.delSentMail(player, mail_data.mail_id);
                    else
                        mail.delSentMail(name, mail_data.mail_id);
                    this.sent_mail_box(player, name);
                } else {
                    mail.delMailIn(name, mail_data.mail_id);
                    this.mail_in_box(player, name);
                };
            };
        });
    },
    set_address(player, err, email_1, email_2, code) {
        if (!config.getEmail().module) {
            this.mail(player);
            player.tell(`${info}服务器尚未开启电子邮件功能,暂时无法绑定电子邮箱`);
        } else if (mail.getEmailAddress(player) != null && !player.isOP()) {
            this.mail(player);
            player.tell(`${info}你设置了电子邮箱地址, 无法更改, 可以咨询服务器管理员`);
        } else {
            let fm = mc.newCustomForm();
            fm.setTitle("设置电子邮件地址");
            if (cache[player.xuid] == null) {
                fm.addInput("填写你用于接收电子邮件的地址\n可以使用QQ邮箱、网易163邮箱等\n若填写错误您将不会收到任何真实的电子邮件\n邮箱一旦设置后,将无法进行更改", "例如: 114514@qq.com", email_1 || "");
                fm.addInput("重复填写一遍,避免出现错误", "例如: 114514@qq.com", email_2 || "");
                if (err != null) { fm.addLabel(err) };
                player.sendForm(fm, (player, id) => {
                    if (id == null) {
                        this.main(player);
                    } else {
                        if (id[0].length == 0 || id[1].length == 0 || id[0] == mail.getEmailAddress(player))
                            this.set_address(player, `§l§c两个输入框都需要填写`, id[0], id[1]);
                        else if (id[0].match(/^[a-zA-z0-9_]{5,30}@[a-zA-z0-9.]{5,30}/) == null)
                            this.set_address(player, `§l§c你填写的好像不是邮箱`, id[0], id[1]);
                        else if (id[0] != id[1])
                            this.set_address(player, `§l§c两次填写的不一样`, id[0], id[1]);
                        else {
                            let num = "";
                            for (let i = 0; i < 6; ++i) { num += Math.floor(Math.random() * 10) };
                            cache[player.xuid] = [id[0], Number(num)];
                            setTimeout(() => { cache[player.xuid] = null }, 60000)
                            sendemail(id[0], mail.getMailHtml(), player.realName, config.getInitialMail.servername, "电子邮箱验证", `验证码: <h1>${num}</h1>验证码有效时间为1分钟, 请在1分钟内填写`)
                            this.set_address(player, `§l§e验证码已发送`, id[0], id[1])
                        };
                    };
                });
            } else {
                if (email_1 == null) { email_1 = email_2 = cache[player.xuid][0] }
                fm.addInput("填写收到的验证码", "", code || "");
                if (err != null) { fm.addLabel(err) };
                player.sendForm(fm, (player, id) => {
                    if (id == null) {
                        this.main(player);
                    } else {
                        if (cache[player.xuid] == null)
                            this.set_address(player, `§l§c验证码已过期`, email_1, email_2);
                        else if (id[0].length == 0)
                            this.set_address(player, `§l§c你好像什么也没操作`, email_1, email_2, id[0]);
                        else if (Number(id[0]) != Number(cache[player.xuid][1]))
                            this.set_address(player, `验证码不正确`, email_1, email_2, id[0]);
                        else {
                            cache[player.xuid] = null
                            player.sendModalForm("更改确认", `是否将电子邮件收件地址更改为: \n${email_1} \n\n确认后您将无法再次修改`, "确认", "重填",
                                (player, zid) => {
                                    if (zid == 0) {
                                        this.set_address(player, null, email_1, email_2);
                                    } else {
                                        mail.setEmailAddress(player, email_1);
                                        sendemail(email_1, mail.getMailHtml(), player.realName, config.getInitialMail().server_name, config.getInitialMail().title, config.getInitialMail().content);
                                        this.main(player);
                                        player.tell(`${info}§2修改成功`);
                                    };
                                });
                        };
                    };
                });
            };
        };
    },
    set_main(player) {
        if (!player.isOP()) {
            player.tell(`${info} 你不是服务器管理员, 无权操作`);
        } else {
            let fm = mc.newSimpleForm();
            fm.setTitle("邮箱设置");
            fm.setContent("选择:");
            fm.addButton("添加自动邮件");
            fm.addButton("更改记分板项");
            fm.addButton("查看玩家收件箱");
            fm.addButton("查看玩家已发送邮件");
            fm.addButton("解除玩家电子邮件地址");
            fm.addButton("设置默认邮件\n修改任意一项玩家下次进服将会收到新的默认邮件");
            player.sendForm(fm, (player, id) => {
                switch (id) {
                    case 0: this.send_prompt(player, "auto");
                        break;
                    case 1: this.config_set(player);
                        break
                    case 2: this.queryplayer_mail_in_box(player);
                        break
                    case 3: this.queryplayer_sent_mail_box(player);
                        break
                    case 4: this.relieveplayer_address(player);
                        break
                    case 5: this.set_initial_mail(player);
                        break
                }
            });
        }
    },
    config_set(player, err, _score) {
        let score_config = config.getScore();
        let fm = mc.newCustomForm();
        fm.setTitle("经济配置");
        fm.addInput("输入计分板项--当前: " + score_config, "例如: money", _score || "");
        if (err != null) { fm.addLabel(err) };
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                this.set_main(player);
            } else {
                if (id[0] == "") {
                    this.config_set(player, "§l§c你好像什么都没有操作", id[0]);
                } else if (id[0] == score_config) {
                    this.config_set(player, "§l§c你填写的与配置文件相同", id[0]);
                } else if (mc.getScoreObjective(id[0]) == null) {
                    let server_score = mc.getAllScoreObjectives();
                    let score_list = "";
                    server_score.forEach((score_, index) => {
                        score_list += `${(Number(index) + 1)}. ${score_.name}\n`
                    })
                    player.sendModalForm("温馨提醒", `您填写的计分板名称服务器上不存在,请检查是否填写有误或现在立即创建您填写的计分板\n当前服务器拥有计分板如下\n${score_list}`, "确认创建", "返回重填",
                        (player, zid) => {
                            if (zid == 0) {
                                this.config_set(player, "§l§e你刚刚填写的计分板服务器上不存在", id[0]);
                            } else {
                                mc.newScoreObjective(id[0], id[0]);
                                this.config_set(player, "§l§2计分板已创建,请重新提交以修改配置文件计分板项", id[0]);
                            };
                        });
                } else {
                    config.set({ score: id[0] });
                    this.config_set(player, "§l§2修改成功");
                };
            };
        });
    },
    queryplayer_mail_in_box(player) {
        let mail_in_data = mail.getMailIn();
        let keys = data.delme(Object.keys(mail_in_data), player);
        let fm = mc.newSimpleForm();
        fm.setTitle("查看玩家收件箱");
        fm.setContent("选择:");
        keys.forEach((key) => {
            fm.addButton(key);
        });
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                this.set_main(player);
            } else {
                this.mail_in_box(player, keys[id]);
            }
        });
    },
    queryplayer_sent_mail_box(player) {
        let mail_in_data = mail.getSentMail();
        let keys = data.delme(Object.keys(mail_in_data), player);
        let fm = mc.newSimpleForm();
        fm.setTitle("查看玩家已发送邮件");
        fm.setContent("选择:");
        keys.forEach((key) => {
            fm.addButton(key);
        });
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                this.set_main(player);
            } else {
                this.sent_mail_box(player, keys[id]);
            };
        });
    },
    relieveplayer_address(player) {
        let email_address = mail.getEmailAddress();
        let keys = data.delme(Object.keys(email_address), player);
        if (keys.length == 0) {
            this.set_main(player);
            player.tell(`${info}没有玩家设置过电子邮件地址`)
        } else {
            let fm = mc.newSimpleForm();
            fm.setTitle("解除玩家电子邮件地址");
            fm.setContent("选择:")
            keys.forEach((key) => {
                fm.addButton(`玩家: ${key}\n地址: ${email_address[key]}`);
            });
            player.sendForm(fm, (player, id) => {
                if (id == null) {
                    this.set_main(player);
                } else {
                    mail.setEmailAddress(keys[id]);
                    this.relieveplayer_address(player);
                    player.tell(`${info}解除成功`);
                };
            });
        };
    },
    set_initial_mail(player, err, name, switchs, title, content, annex, item, money, score, vip) {
        let item_list = data.valid_item(player.getInventory().getAllItems())
        let select = ["不设置", "不修改"]
        item_list.forEach((item) => {
            select.push(data.item_names(item))
        })
        let initial_mail = config.getInitialMail();
        let fm = mc.newCustomForm()
        fm.setTitle("设置默认邮件");
        fm.addSwitch("默认邮件模块开关", switchs || initial_mail.module);
        fm.addInput(`服务器名称(发件人)---当前: ${initial_mail.server_name}`, "例如:系统", name || "")
        fm.addInput(`标题---当前: ${initial_mail.title}`, "例如: 欢迎进入服务器", title || "")
        fm.addInput(`内容---当前: \n${initial_mail.content}`, "例如: 欢迎来到服务器...", content || "")
        fm.addSwitch(`附件模块开关`, annex || initial_mail.annex.module)
        fm.addDropdown("附件: 物品", select, item || 0)
        fm.addInput(`附件: Money---当前: ${initial_mail.annex.money}金币`, "本项为选填", money || "")
        fm.addInput(`附件: 计分板---当前: ${initial_mail.annex.score}金币`, "本项为选填", score || "")
        fm.addInput(`附件: VIP---当前: ${initial_mail.annex.vip}天`, vip || "")
        if (err != null) { fm.addLabel(err) }
        player.sendForm(fm, (player, id) => {
            if (id == null) {
                this.set_main(player);
            } else {
                if (id[1].length > 0)
                    name = id[1];
                else
                    name = initial_mail.server_name;
                if (id[2].length > 0)
                    title = id[2];
                else
                    title = initial_mail.title;
                if (id[3].length > 0)
                    content = id[3];
                else
                    content = initial_mail.content;
                if (id[5] == 0) {
                    item = null;
                } else if (id[5] == 1) {
                    item = initial_mail.annex.item
                } else {
                    item = item_list[id[5] - 2].getNbt().toSNBT();
                }
                if (id[6].length > 0)
                    if (!isNaN(id[6]) && id[6] >= 1 && id[6] <= 100000)
                        money = Number(id[6]);
                    else
                        money = ["err", "§l§c请正确填写附件Money数量\n1-100000"];
                else
                    money = initial_mail.annex.money;
                if (id[7].length > 0)
                    if (!isNaN(id[7]) && id[7] >= 1 && id[7] <= 100000)
                        score = Number(id[7]);
                    else
                        score = ["err", "§l§c请正确填写附件计分板数量\n1-100000"];
                else
                    score = initial_mail.annex.score;
                if (id[8].length > 0)
                    if (!isNaN(id[8]) && id[8] >= 1 && id[8] <= 365)
                        vip = Number(id[8]);
                    else
                        vip = ["err", "§l§c请正确填写附件会员时长\n1-365"];
                else
                    vip = initial_mail.annex.vip;
                if (money[0] == "err")
                    this.set_initial_mail(player, money[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7], id[8]);
                else if (score == "err")
                    this.set_initial_mail(player, score[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7], id[8]);
                else if (vip == "err")
                    this.set_initial_mail(player, vip[1], id[0], id[1], id[2], id[3], id[4], id[5], id[6], id[7], id[8]);
                else {
                    if (id[0] == initial_mail.module && name == initial_mail.server_name && title == initial_mail.title && content == initial_mail.content, id[4] == initial_mail.annex.module && item == initial_mail.annex.item && money == initial_mail.annex.money && score == initial_mail.annex.score && vip == initial_mail.annex.vip)
                        received = initial_mail.received;
                    else
                        received = [];
                    config.set({ initial_mail: { module: id[0], server_name: name, title: title, content: content, annex: { module: id[4], item: item, money: money, score: score, vip: vip }, received: received } });
                    this.set_initial_mail(player, "§l§2修改成功");
                };
            };
        });
    }
};
const out = {
    getMailIn(player) { return mail.getMailIn(player) || [] },
    getSentMail(player) { return mail.getSentMail(player) || [] },
    getMailIn_Count(player) { return out.getMailIn(player).length },
    getSentMail_Count(player) { return out.getSentMail(player).length },
    getEmailAddress(player) { return mail.getEmailAddress(player) },
    setEmailAddress(player, address) {
        let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
        if (player == null)
            return { state: false, content: "缺少玩家参数（可传递Player或玩家的名字）" };
        else if (address == null)
            return { state: false, content: "缺少邮箱地址参数" };
        else if (!regex.test(address))
            return { state: false, content: "邮箱参数错误,这不是一个电子邮箱地址" };
        else
            return mail.setEmailAddress(player, address);
    },
    regSystem(name) {
        if (!system_mail.includes(name)) {
            system_mail.push(name);
            return { state: true, content: "注册系统发件人成功" };
        } else {
            return { state: false, content: "要注册的系统发件人已存" };
        };
    },
    addMail(name, id, title, content, annex) {
        if (name == null) {
            return { state: false, content: "要发送的邮件没有收件人" };
        } else if (name == "") {
            return { state: false, content: "要发送的邮件没有收件人或不正确" };
        } else if (data.isChinese(name)) {
            return { state: false, content: "要发送的邮件收件人不能是中文" };
        } else if (id == null) {
            return { state: false, content: "必须填写发件人" };
        } else if (id == "") {
            return { state: false, content: "发件人名字不能为空" };
        } else if (title == null) {
            return { state: false, content: "邮件标题不能为空" };
        } else if (title == "") {
            return { state: false, content: "邮件标题不能为空" };
        } else if (content == null) {
            return { state: false, content: "邮件内容不能为空" };
        } if (content == "") {
            return { state: false, content: "邮件内容不能为空" };
        } else if (annex != null) {
            if (annex.item != null) {
                var itemnbt = mc.newItem(NBT.parseSNBT(annex.item));
                if (itemnbt == null) {
                    return { state: false, content: "错误,物品必须是NBT数据" };
                } else {
                    if (itemnbt.type == "") {
                        return { state: false, content: "错误,要邮寄的附件并不是MC物品NBT" };
                    } else {
                        mail.addMailIn(name, null, id, title, content, annex);
                        return { state: true, content: "邮件发送成功" };
                    };
                };
            } else {
                mail.addMailIn(name, null, id, title, content, annex);
                return { state: true, content: "邮件发送成功" };
            };
        } else {
            mail.addMailIn(name, null, id, title, content, annex);
            return { state: true, content: "邮件发送成功" };
        };
    },
    send_email(address, html, to_name, form_name, title, content) {
        let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
        if (!regex.test(address))
            return { state: false, content: "接收地址不是邮箱地址" };
        else if (to_name == null)
            return { state: false, content: "请输入一个接收者的名称" };
        else if (form_name == null)
            return { state: false, content: "请输入一个发送者的名称" };
        else if (title == null)
            return { state: false, content: "请输入一个电子邮件标题" };
        else if (content == null)
            return { state: false, content: "请输入一些电子邮件内容" };
        else {
            sendemail(address, html || mail.getMailHtml(), to_name, form_name, title, content)
            return { state: true, content: "电子邮件发送成功" };
        };
    }
};
ll.exports(config.getVersion, "PMail", "version");
ll.exports(out.send_email, "PMail", "send_email");
ll.exports(out.getMailIn, "PMail", "mail_in");
ll.exports(out.getMailIn_Count, "PMail", "mail_in_count");
ll.exports(out.getSentMail, "PMail", "sent_mail");
ll.exports(out.getSentMail_Count, "PMail", "sent_mail_count");
ll.exports(out.getEmailAddress, "PMail", "get_address");
ll.exports(out.setEmailAddress, "PMail", "set_address");
// 兼容旧接口
ll.exports(out.getMailIn, "PMail", "getinmailbox");
ll.exports(out.getSentMail, "PMail", "getoutmailbox");
ll.exports(out.getMailIn_Count, "PMail", "getmailcount");
ll.exports(out.addMail, "PMail", "addnewmail");
ll.exports(out.regSystem, "PMail", "regsystem");
const papi = {
    regMailInCount(player) {
        if (typeof player != "object")
            player = mc.getPlayer(player);
        let mail_in_box = mail.getMailIn(player) || [];
        return String(mail_in_box.length);
    },
    regUnreadCount(player) {
        if (typeof player != "object")
            player = mc.getPlayer(player);
        let mail_in_box = mail.getMailIn(player) || [];
        let mail_in = [];
        mail_in_box.forEach((mail_data) => {
            if (!mail_data.read)
                mail_in.push(mail_data);
        })
        return String(mail_in.length);
    },
    regSentMailCount(player) {
        if (typeof player != "object")
            player = mc.getPlayer(player);
        let sent_mail_box = mail.getSentMail(player) || [];
        return String(sent_mail_box.length);
    }
};
mc.listen("onServerStarted", () => {
    mail.modifyMailIn("SUNSServer")
    if (config.getVersion() == null) {
        config.initial();
        mail.initialMailHtml();
    } else
        config.update();
    cmd.register([{ cmd: "mail", des: "邮箱", per: PermType.Any }, { cmd: "mailset", des: "邮箱设置", per: PermType.Any }, { cmd: "sendmail", des: "发送邮件", per: PermType.Console }])
    system_mail.push(config.getInitialMail().server_name);
    auto.delExpireAutoMail();
    if (docking.PAPI() || docking.GMLIB()) {
        docking.PAPIjs().registerPlayerPlaceholder(papi.regMailInCount, "PMail", "player_mail_in_count");
        docking.PAPIjs().registerPlayerPlaceholder(papi.regMailInCount, "PMail", "player_unread_count");
        docking.PAPIjs().registerPlayerPlaceholder(papi.regMailInCount, "PMail", "player_sent_mail_count");
    };
    network.httpGet(url, (status, result) => {
        if (status == 200) {
            let http_info = JSON.parse(result);
            if (http_info != null) {
                http_info.updatemes = http_info.updatemes[http_info.fixvers] ?? http_info.updatemes[http_info.version] ?? "更新内容参数错误";
                http_info.updatemes += `,Minebbs: ${http_info.links?.minebbs ?? "无"},下载直链: ${http_info.links?.download[http_info.fixvers] ?? http_info.links?.download[http_info.version] ?? "无"},文档说明: ${http_info.links?.docs ?? "五"}`;
                http_info.version = `v${http_info.version} ${http_info.fixvers}`.trim();
                let version = `${versions} ${fixvers}`.trim();
                if (http_info.version > version) {
                    colorLog("yellow", `网络连接成功 插件有新版本 当前插件版本${version},最新版${http_info.version}\n更新内容\n${http_info.updatemes.replace(/,/g, "\n")}`);
                } else {
                    colorLog("yellow", `网络连接成功 当前已是最新版本`);
                };
            } else {
                colorLog("red", "网络参数不正确,请联系开发者处理");
            };
        } else {
            colorLog("red", "网络故障或无法访问目标网站以获取插件更新内容");
        };
    });
});
mc.listen("onJoin", (player) => {
    let initial_mail = config.getInitialMail();
    if (initial_mail.module && !initial_mail.received.includes(player.realName)) {
        let annex_info = "附件:";
        if (initial_mail.annex.module) {
            if (initial_mail.annex.item != null) {
                let item = mc.newItem(NBT.parseSNBT(initial_mail.annex.item))
                annex_info += `\n     物品--- ${data.item_names(item)}x${item.count}§r`;
            }
            if (initial_mail.annex.money != null)
                annex_info += `\n     Money--- ${initial_mail.annex.money} 金币`;
            if (initial_mail.annex.score != null)
                annex_info += `\n     记分板--- ${initial_mail.annex.score} 金币`;
            if (initial_mail.annex.vip != null)
                annex_info += `\n     会员--- ${initial_mail.annex.vip} 天`;
        }
        if (annex_info == "附件:")
            annex_info = "";
        mail.addMailIn(player.realName, null, initial_mail.server_name, initial_mail.title, `${initial_mail.content} \n\n\n${annex_info} `, { item: initial_mail.annex.item, money: initial_mail.annex.money, score: initial_mail.annex.score, vip: initial_mail.annex.vip }, false);
        initial_mail.received.push(player.realName);
        config.set({ initial_mail: initial_mail });
    };
    let auto_sent_mail = mail.getAutoSentMail();
    let mail_id = Object.keys(auto_sent_mail);
    mail_id.forEach((mail_id) => {
        let auto_mail = auto_sent_mail[mail_id]
        if (!auto_mail.received.includes(player.realName)) {
            let annex_info = "附件:";
            if (auto_mail.annex.item != null) {
                let item = mc.newItem(NBT.parseSNBT(auto_mail.annex.item))
                annex_info += `\n     物品--- ${data.item_names(item)}x${item.count}§r`;
            }
            if (auto_mail.annex.money != null)
                annex_info += `\n     Money--- ${auto_mail.annex.money} 金币`;
            if (auto_mail.annex.score != null)
                annex_info += `\n     记分板--- ${auto_mail.annex.score} 金币`;
            if (auto_mail.annex.vip != null)
                annex_info += `\n     会员--- ${auto_mail.annex.vip} 天`;
            if (annex_info == "附件:")
                annex_info = "";
            auto_mail.received.push(player.realName);
            mail.addMailIn(player.realName, null, auto_mail.id, auto_mail.title, `${auto_mail.content} \n\n\n${annex_info} `, { item: auto_mail.annex.item, money: auto_mail.annex.money, score: auto_mail.annex.score, vip: auto_mail.annex.vip }, false);
            mail.setAutoSentMail(mail_id, auto_mail)
        };
    });
    let strtime = system.getTimeStr();
    let mail_retention = config.getMailRetention()
    let mail_in_box = mail.getMailIn(player) || [];
    mail_in_box.forEach((mail_data) => {
        let interval = (new Date(strtime).getTime() - new Date(mail_data.time).getTime()) / (1000 * 60 * 60 * 24);
        if (Math.ceil(mail_retention - interval) <= 0)
            mail.delMailIn(player, mail_data.mail_id);
    });
    let sent_mail_box = mail.getSentMail(player) || [];
    sent_mail_box.forEach((mail_data) => {
        let interval = (new Date(strtime).getTime() - new Date(mail_data.time).getTime()) / (1000 * 60 * 60 * 24);
        if (Math.ceil(mail_retention - interval) <= 0)
            mail.delSentMail(player, mail_data.mail_id);
    });
});


if (fixvers == "") { var fix = " 正式版" } else { var fix = ` ${fixvers} 开发版`; logger.warn("当前版本为开发版,请勿用于生产环境！！！"); }
ll.registerPlugin("PMail", "Mail System", regvers, { Author: author, Docs: `https://docs.mcmap.top/#/plugins/LLSE/PMail`, Names: "邮箱系统", "Fix Version": fix.replace(/ /, "") });
logger.info(`邮箱系统插件---加载成功,当前版本：${versions}${fix} 作者: ${author}`)