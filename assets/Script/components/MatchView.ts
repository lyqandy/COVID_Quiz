// import "./MGOBE";
import Global from "../Global";
import { share, invitation } from '../libs/share';
import { audio } from '../components/AudioPlayer';
import Bot from "../libs/bot";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MatchView extends cc.Component {

    @property(cc.Label)
    matchLabel: cc.Label = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Sprite)
    ownSprite: cc.Sprite = null;

    @property(cc.Label)
    ownName: cc.Label = null;

    @property(cc.Label)
    otherName: cc.Label = null;

    @property(cc.Label)
    ownScore: cc.Label = null;

    @property(cc.Label)
    otherScore: cc.Label = null;

    @property(cc.Label)
    ownLv: cc.Label = null;

    @property(cc.Label)
    otherLv: cc.Label = null;

    @property(cc.Sprite)
    otherSprite: cc.Sprite = null;

    @property(cc.Node)
    mainNode: cc.Node = null;

    @property(cc.Node)
    matchingNode: cc.Node = null;

    @property(cc.SpriteFrame)
    qieIcon: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    nullIcon: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    coinIcon: cc.SpriteFrame = null;

    @property(cc.Node)
    invitationNode: cc.Node = null;

    @property(cc.Label)
    invitationLabel: cc.Label = null;

    @property(cc.Node)
    invitationBtn1: cc.Node = null;

    @property(cc.Node)
    invitationBtn2: cc.Node = null;

    @property(cc.Node)
    matchIcon: cc.Node = null;

    countnumber: number = 0;
    matchPlayersPara = null;
    playerInfo = null;
    playID = null;
    sendToGameServerPara = {
        data: {
            cmd: "READY",
        },
    };
    ti = null;
    mi = null;
    outTime: number = 0;
    btnState: boolean = false;
    invitaInfo = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // cc.director.on('updateUserInfo', () => {
        //     this.ownScore.string = "积分：" + Global.score;
        //     this.ownLv.string = "正确率：" + Global.accuracy + "%";
        // });
    }
    init() {
        this.bg.height = cc.winSize.height;
        this.countnumber = 0;
        Global.matchView = this.node;

        console.log('MatchView');
        // if (Global.newFriendPlayer) {
        //     this.joinRoom(Global.newFriendPlayer.query.roomId,Global.newFriendPlayer)
        //     Global.newFriendPlayer = null;
        // }
    }

    start() {
        if (Global.userInfo.avatarUrl !== "" && Global.userInfo.avatarUrl !== "q123") {
            cc.loader.load({ url: Global.userInfo.avatarUrl, type: 'png' }, (err, texture) => {
                console.log(texture);
                var sprite = new cc.SpriteFrame(texture);
                this.ownSprite.getComponent(cc.Sprite).spriteFrame = sprite;
            });
        } else {
            this.ownSprite.getComponent(cc.Sprite).spriteFrame = this.qieIcon;
        }
        this.ownName.string = Global.userInfo.nickName;
        this.ownScore.string = t("积分：") + Global.score;
        this.ownLv.string = t("正确率") + "：" + Global.accuracy + "%";

    }

    matchingBtnCLick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);
            console.log('开始匹配');
            Global.room.leaveRoom({}, event => {
                if (event.code === 0) {
                    // 退房成功
                    console.log("退房成功", Global.room.roomInfo.id);
                    // 可以使用 initRoom 清除 roomInfo
                    Global.room.initRoom();
                }
            });
            //
            this.matchEffect();
            // MGOBE.DebuggerLog.enable = true
            this.matchLabel.string = t("匹配中") + "...";

            this.ti = setInterval(() => {
                this.matchLabel.string = t("匹配中") + "..." + String(this.countnumber++) + t("秒");
                if (this.countnumber >= 15) {
                    clearInterval(this.ti);
                    this.matchLabel.string = t("匹配失败，请重新匹配");
                }
            }, 1000);

            this.playerInfo = {
                name: Global.userInfo.nickName,
                customPlayerStatus: 1,
                customProfile: '{"openId": "' + Global.openId + '", "avatarUrl": "' + Global.userInfo.avatarUrl + '", "score": "' + Global.score + '", "accuracy":"' + Global.accuracy + '"}',
                matchAttributes: []
            };
            let playerInfo = this.playerInfo;

            this.matchPlayersPara = {
                playerInfo,
                matchCode: Global.matchCode,
            };
            Global.room.matchPlayers(this.matchPlayersPara, event => {
                console.log("请求数据", event);
                if (event.code === 0) {
                    console.log('请求成功');
                } else {
                    console.log('请求失败');
                    clearInterval(this.ti);
                    this.matchLabel.string = t("匹配失败，请重新匹配");
                }
            })
            this.mainNode.active = false;
            this.matchingNode.active = true;
            //
            MGOBE.Room.onMatch = (event) => {
                if (event.data.errCode === MGOBE.ErrCode.EC_OK) {
                    console.log("匹配成功", event);
                    // return;
                    // Global.playerId = event.data.roomInfo.playerList[0].id;

                    this.mi = setInterval(() => {
                        this.outTime += 1;
                        console.log("this.outTime", this.outTime);
                        if (this.outTime >= 10) {
                            console.log("超时掉线");
                            Global.room.leaveRoom({}, event => {
                                if (event.code === 0) {
                                    // 退房成功
                                    console.log("退房成功", Global.room.roomInfo.id);
                                    // 可以使用 initRoom 清除 roomInfo
                                    Global.room.initRoom();
                                }
                            });
                            clearInterval(this.ti);
                            clearInterval(this.mi);
                            this.node.destroy();
                            const ev = new cc.Event.EventCustom('timeout-line', false);
                            cc.director.dispatchEvent(ev);
                        }
                    }, 1000);

                    this.matchIcon.active = false;

                    this.matchingNode.active = false;
                    Global.otherNickName = event.data.roomInfo.playerList[1].name;
                    // Global.otherAvatarUrl = event.data.roomInfo.playerList[1].customProfile;
                    let info = null;
                    if (Global.playerId === event.data.roomInfo.playerList[1].id) {
                        info = event.data.roomInfo.playerList[0];
                    } else {
                        info = event.data.roomInfo.playerList[1];
                    }
                    this.otherName.string = info.name;

                    if (info.isRobot) {
                        Global.otherAvatarUrl = Bot.bot[this.rndNum()].figureurl;
                        cc.loader.load(
                            { url: Global.otherAvatarUrl, type: 'png' },
                            (err: any, texture: cc.Texture2D) => {
                                this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                            }
                        );
                    } else {
                        if (JSON.parse(info.customProfile).avatarUrl === '' || JSON.parse(info.customProfile).avatarUrl === 'q123') {
                            this.otherSprite.spriteFrame = this.qieIcon;
                            Global.otherAvatarUrl = JSON.parse(info.customProfile).avatarUrl;
                        } else {
                            Global.otherAvatarUrl = JSON.parse(info.customProfile).avatarUrl;
                            cc.loader.load(
                                { url: Global.otherAvatarUrl, type: 'png' },
                                (err: any, texture: cc.Texture2D) => {
                                    this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                                }
                            );
                        }
                    }
                    if (info.customProfile !== "" && JSON.parse(info.customProfile).score) {
                        this.otherScore.string = t("积分：") + JSON.parse(info.customProfile).score;
                        this.otherLv.string = "t(正确率：") + JSON.parse(info.customProfile).accuracy + "%";
                    } else {
                        this.otherScore.string = t("积分：") + Math.round(Global.score * Math.random());
                        this.otherLv.string = t("正确率：") + Math.round(Global.accuracy * Math.random()) + "%";
                    }

                    Global.room.initRoom(event.data.roomInfo);
                    Global.room.sendToGameSvr(this.sendToGameServerPara, event => {
                        if (event.code === 0) {
                            console.log("准备开始");
                        }
                    })

                    Global.room.onRecvFromGameSvr = (event) => {
                        if (event.data && event.data.data) {
                            console.log('服务器广播', event.data.data.gameState);
                            if (event.data.data.gameState.curRound === -1) {
                                if (!Global.gameState) {
                                    clearInterval(this.ti);
                                    clearInterval(this.mi);
                                    this.outTime = 0;
                                    const ev = new cc.Event.EventCustom('play-start', false);
                                    cc.director.dispatchEvent(ev);
                                    this.node.destroy();
                                }
                            }
                        }
                    }
                    return;
                }
                console.log("匹配失败");
            }
        }
    }

    matchEffect() {
        this.otherSprite.spriteFrame = this.nullIcon;
        this.matchIcon.active = true;

        cc.loader.loadRes("/Effect/Prefab/Search_effect", (err, prefab) => {
            if (err) {
                this.matchEffect();
            } else {
                let anim = cc.instantiate(prefab);
                anim.getComponent(cc.Animation).play('Search_effect');
                this.matchIcon.addChild(anim, 102);
            }
        });

    }

    invitationBtnClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            console.log('邀请好友');
            console.log('FriendPVP.onInviteButtonClick');
            // if (Global.userInfo) {

            // } else {
            //     let i ={

            //     } 
            //     Global.userInfo = 
            // }
            let playerInfo = {
                name: Global.userInfo.nickName,
                customPlayerStatus: 1,
                customProfile: '{"openId": "' + Global.openId + '", "avatarUrl": "' + Global.userInfo.avatarUrl + '", "score": "' + Global.score + '", "accuracy":"' + Global.accuracy + '"}',
                matchAttributes: []
            };
            var createTeamRoomPara = {
                roomName: "Knowledge competition",
                maxPlayers: 2,
                roomType: "1v1",
                isPrivate: false,
                customProperties: 'WAIT',
                playerInfo,
                teamNumber: 2,
            }

            Global.room.createTeamRoom(createTeamRoomPara, event => {
                if (event.code === 0) {
                    console.log("createTeamRoom success", event);
                    const roomId = event.data.roomInfo.id;
                    const teamId = event.data.roomInfo.playerList[0].teamId;
                    console.log("roomId", roomId);
                    console.log("teamId", teamId);

                    this.invitaInfo = `roomId=${roomId}&teamId=${teamId}&avatarUrl=${Global.userInfo.avatarUrl}&hostId=${Global.playerId}`
                    invitation({
                        title: t('快来和我PK防疫知识！'),
                        query: `roomId=${roomId}&teamId=${teamId}&avatarUrl=${Global.userInfo.avatarUrl}&hostId=${Global.playerId}`
                    });
                }
            })
            Global.room.onJoinRoom = (event) => {
                if (event.data.joinPlayerId === Global.playerId) {
                    console.log("监听到自己加入房间");
                    return;
                }
                this.onOtherJoinRoom(event);
                this.invitationLabel.string = "答题马上开始，请稍等"
                this.invitationBtn1.active = false;
                this.invitationBtn2.active = false;

                setTimeout(() => {
                    Global.room.initRoom(event.data.roomInfo);
                    Global.room.sendToGameSvr(this.sendToGameServerPara, event => {
                        if (event.code === 0) {
                            console.log("准备开始");
                        }
                    })

                    Global.room.onRecvFromGameSvr = (event) => {
                        if (event.data && event.data.data) {
                            console.log('服务器广播', event.data.data.gameState);
                            if (event.data.data.gameState.curRound === -1) {
                                if (!Global.gameState) {
                                    cc.audioEngine.stopAll();
                                    const ev = new cc.Event.EventCustom('play-start', false);
                                    cc.director.dispatchEvent(ev);
                                    this.node.destroy();
                                }
                            }
                        }
                    }
                }, 1000);
            }

            //邀请好友
            this.mainNode.active = false;
            this.invitationNode.active = true;
            //
        }
    }

    matchingBackClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            console.log('取消匹配');
            //取消匹配
            this.otherSprite.spriteFrame = this.coinIcon;

            this.countnumber = 0;
            clearInterval(this.ti);

            this.matchIcon.removeAllChildren();

            const cancelMatchPara = {
                matchType: MGOBE.ENUM.MatchType.PLAYER_COMPLEX,
            };
            Global.room.cancelPlayerMatch(cancelMatchPara, event => {
                console.log("cancelPlayerMatch", event)
            });
            Global.room.leaveRoom({}, event => {
                if (event.code === 0) {
                    // 退房成功
                    console.log("退房成功", Global.room.roomInfo.id);
                    // 可以使用 initRoom 清除 roomInfo
                    Global.room.initRoom();
                }
            });
            this.mainNode.active = true;
            this.matchingNode.active = false;
            //
        }
    }

    invitationCancelClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            console.log('放弃邀请，并关闭房间');
            //放弃邀请，并关闭房间
            Global.room.dismissRoom({}, event => {
                if (event.code === 0) {
                    console.log("解散成功");
                }
            });
            Global.room.leaveRoom({}, event => {
                if (event.code === 0) {
                    // 退房成功
                    console.log("退房成功", Global.room.roomInfo.id);
                    // 可以使用 initRoom 清除 roomInfo
                    Global.room.initRoom();
                }
            });
            this.mainNode.active = true;
            this.invitationNode.active = false;
        }
    }

    invitationAgain() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            console.log('再次邀请信息', this.invitaInfo);

            invitation({
                title: t('快来和我PK防疫知识！'),
                query: this.invitaInfo
            });

            // Global.room.dismissRoom({}, event => {
            //     if (event.code === 0) {
            //         console.log("解散成功");
            //         this.invitationBtnClick();
            //     }
            // });
            // Global.room.leaveRoom({}, event => {
            //     if (event.code === 0) {
            //         // 退房成功
            //         console.log("退房成功", Global.room.roomInfo.id);
            //         // 可以使用 initRoom 清除 roomInfo
            //         Global.room.initRoom();
            //         this.invitationBtnClick();
            //     }
            // });

            //再次邀请
        }
    }

    joinRoom(roomId: string, ev) {
        console.log("加入别人房间", ev)
        //设置别人头像，名字
        this.mainNode.active = false;
        this.invitationNode.active = true;
        let info = ev.query;
        if (info.avatarUrl !== '' && info.avatarUrl !== 'q123') {
            Global.otherAvatarUrl = info.avatarUrl;
            cc.loader.load(
                { url: info.avatarUrl, type: 'png' },
                (err: any, texture: cc.Texture2D) => {
                    this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                }
            );
        } else {
            if (info.avatarUrl === 'q123') {
                Global.otherAvatarUrl = info.avatarUrl;
                this.otherSprite.spriteFrame = this.qieIcon;
            } else {
                Global.otherAvatarUrl = Bot.bot[this.rndNum()].figureurl;
                cc.loader.load(
                    { url: Global.otherAvatarUrl, type: 'png' },
                    (err: any, texture: cc.Texture2D) => {
                        this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                    }
                );
            }
        }

        this.invitationLabel.string = "答题马上开始，请稍等"
        this.invitationBtn1.active = false;
        this.invitationBtn2.active = false;
        // console.log("卡在这了");

        const playerInfo = {
            name: Global.userInfo.nickName,
            customPlayerStatus: 1,
            customProfile: '{"openId": "' + Global.openId + '", "avatarUrl": "' + Global.userInfo.avatarUrl + '", "score": "' + Global.score + '", "accuracy":"' + Global.accuracy + '"}',
        };

        var joinTeamRoomPara = {
            playerInfo,
            teamId: '1',
        }

        Global.room.initRoom({ id: roomId });

        Global.room.joinTeamRoom(joinTeamRoomPara, event => {
            if (event.code === 0) {
                console.log("success", event);

                let info = event.data.roomInfo.playerList[0]
                // Global.playerId = event.data.roomInfo.playerList[1].id;
                this.otherName.string = info.name;
                // if (info.customProfile !== '' && JSON.parse(info.customProfile).avatarUrl !== '' && JSON.parse(info.customProfile).avatarUrl !== 'q123') {
                //     Global.otherAvatarUrl = JSON.parse(info.customProfile).avatarUrl;
                //     // cc.loader.load(
                //     //     { url: JSON.parse(info.customProfile).avatarUrl, type: 'png' },
                //     //     (err: any, texture: cc.Texture2D) => {
                //     //         this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                //     //     }
                //     // );
                // } else {
                //     if (JSON.parse(info.customProfile).avatarUrl === 'q123') {
                //         Global.otherAvatarUrl = JSON.parse(info.customProfile).avatarUrl;
                //         this.otherSprite.spriteFrame = this.qieIcon;
                //     } else {
                //         // this.otherSprite.spriteFrame = this.qieIcon;
                //         Global.otherAvatarUrl = Bot.bot[this.rndNum()].figureurl;
                //         // this.otherSprite.spriteFrame = this.qieIcon;
                //         cc.loader.load(
                //             { url: Global.otherAvatarUrl, type: 'png' },
                //             (err: any, texture: cc.Texture2D) => {
                //                 this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                //             }
                //         );
                //     }
                // }

                if (info.customProfile !== "" && JSON.parse(info.customProfile).score) {
                    this.otherScore.string = t("积分：") + JSON.parse(info.customProfile).score;
                    this.otherLv.string = t("正确率：") + JSON.parse(info.customProfile).accuracy + "%";
                } else {
                    this.otherScore.string = t("积分：") + Math.round(Global.score * Math.random());
                    this.otherLv.string = t("正确率：") + Math.round(Global.accuracy * Math.random()) + "%";
                }

                Global.room.sendToGameSvr(this.sendToGameServerPara, event => {
                    if (event.code === 0) {
                        console.log("准备开始");
                    }
                })
                if (!Global.gameState) {
                    console.log("游戏准备进入");
                    const ev = new cc.Event.EventCustom('play-start', false);
                    cc.director.dispatchEvent(ev);
                    this.node.destroy();
                }


            } else {
                console.log("加入失败");
                // this.invitationLabel.string = "房主已关闭房间，请重新发起匹配吧"
                // this.invitationBtn2.active = true;
                // this.node.destroy();
                if (Global.personalView) { Global.personalView.destroy(); }
                if (Global.resultView) { Global.resultView.destroy(); }
                if (Global.settlementView) { Global.settlementView.destroy(); }
                if (Global.playerView) { Global.playerView.destroy(); }
                this.closeBtnClick();
                const ev = new cc.Event.EventCustom('back-mainView', false);
                cc.director.dispatchEvent(ev);

            }
        })
        // Global.room.sendToGameSvr(this.sendToGameServerPara, event => {
        //     if (event.code === 0) {
        //         console.log("准备开始");
        //     }
        // })


    }

    onOtherJoinRoom(ev: MGOBE.types.BroadcastEvent<MGOBE.types.JoinRoomBst>) {
        console.log('Other Join Room:', ev);
        // Global.playerId = ev.data.roomInfo.playerList[0].id;

        const other = ev.data.roomInfo.playerList[1];
        this.otherName.string = other.name;

        console.log("customProfile路径", JSON.parse(other.customProfile).avatarUrl);

        if (other.customProfile !== '' && JSON.parse(other.customProfile).avatarUrl !== '' && JSON.parse(other.customProfile).avatarUrl !== 'q123') {
            Global.otherAvatarUrl = JSON.parse(other.customProfile).avatarUrl;
            cc.loader.load(
                { url: JSON.parse(other.customProfile).avatarUrl, type: 'png' },
                (err: any, texture: cc.Texture2D) => {
                    this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                }
            );
        } else {
            if (JSON.parse(other.customProfile).avatarUrl === 'q123') {
                Global.otherAvatarUrl = JSON.parse(other.customProfile).avatarUrl;
                this.otherSprite.spriteFrame = this.qieIcon;
            } else {
                Global.otherAvatarUrl = Bot.bot[this.rndNum()].figureurl;
                // this.otherSprite.spriteFrame = this.qieIcon;
                cc.loader.load(
                    { url: Global.otherAvatarUrl, type: 'png' },
                    (err: any, texture: cc.Texture2D) => {
                        this.otherSprite.spriteFrame = new cc.SpriteFrame(texture);
                    }
                );
            }
        }

        if (other.customProfile !== "" && JSON.parse(other.customProfile).score) {
            this.otherScore.string = t("积分：") + JSON.parse(other.customProfile).score;
            this.otherLv.string = t("正确率：") + JSON.parse(other.customProfile).accuracy + "%";
        } else {
            this.otherScore.string = t("积分：") + Math.round(Global.score * Math.random());
            this.otherLv.string = t("正确率：") + Math.round(Global.accuracy * Math.random()) + "%";
        }
    }

    rndNum() {
        return Math.random() * 100 | 0;
        // return 0;
    }

    closeBtnClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            const cancelMatchPara = {
                matchType: MGOBE.ENUM.MatchType.PLAYER_COMPLEX,
            };
            Global.room.cancelPlayerMatch(cancelMatchPara, event => {
                console.log("cancelPlayerMatch", event)
            });

            Global.room.leaveRoom({}, event => {
                if (event.code === 0) {
                    // 退房成功
                    console.log("退房成功", Global.room.roomInfo.id);
                    // 可以使用 initRoom 清除 roomInfo
                    Global.room.initRoom();
                }
            });
            clearInterval(this.ti);
            if (Global.personalView) { Global.personalView.destroy(); }
            if (Global.resultView) { Global.resultView.destroy(); }
            if (Global.settlementView) { Global.settlementView.destroy(); }
            if (Global.playerView) { Global.playerView.destroy(); }
            MGOBE.Room.onCancelMatch = e => console.log("onCancleMatch");
            this.node.destroy();
            // const ev = new cc.Event.EventCustom('back-mainView', false);
            // cc.director.dispatchEvent(ev);

        }
    }
    // update (dt) {
    // }

    onDestroy() {

        const cancelMatchPara = {
            matchType: MGOBE.ENUM.MatchType.PLAYER_COMPLEX,
        };
        Global.room.cancelPlayerMatch(cancelMatchPara, event => {
            console.log("cancelPlayerMatch", event)
        });
        clearInterval(this.ti);
        clearInterval(this.mi)
        Global.matchView = null;
    }
}