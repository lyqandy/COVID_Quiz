import Global from "../Global";
import LeaderboardManager from '../libs/LeaderboardManager';
import { audio, bgmSwitch } from '../components/AudioPlayer';

const { ccclass, property } = cc._decorator;

declare var wx: any

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    attribute: cc.Node = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Node)
    bottomNode: cc.Node = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    score: cc.Label = null;

    @property(cc.Label)
    accuracy: cc.Label = null;

    @property(cc.Node)
    anims: cc.Node = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    @property(cc.Node)
    loadingBg: cc.Node = null;

    @property(cc.Node)
    settingBg: cc.Node = null;

    @property(cc.Label)
    userIdLabel: cc.Label = null;

    @property(cc.Node)
    loadingIcon: cc.Node = null;

    @property(cc.Node)
    webView: cc.Node = null;

    @property(cc.SpriteFrame)
    headSpriteFrame: cc.SpriteFrame = null;

    @property(cc.Button)
    personalButton: cc.Button = null;

    @property(cc.Node)
    settingNode: cc.Node = null;

    @property(cc.Sprite)
    effectBtn: cc.Sprite = null;

    @property(cc.Sprite)
    bgmBtn: cc.Sprite = null;

    @property(cc.Node)
    viewNode: cc.Node = null;

    @property([cc.SpriteFrame])
    btnSpriteFrame: Array<cc.SpriteFrame> = [];

    @property([cc.SpriteFrame])
    soundSpriteFrame: Array<cc.SpriteFrame> = [];

    @property(cc.Sprite)
    soundBtn: cc.Sprite = null;

    @property(cc.Node)
    prompt: cc.Node = null;


    // LIFE-CYCLE CALLBACKS:
    private _shouldLoadLeaderBoard = true;
    private _leaderboard: cc.Node = null;

    testScore = 100;
    btnState: boolean = false;

    onLoad() {
        console.log('Gamescene.onLoad');
        this.initSDK();
        const check = (options) => {
            if (options.query.hostId !== Global.playerId) {
                this.joinFriendPvp(options.query.roomId, options);
            } else {
                Global.room.dismissRoom({}, event => {
                    if (event.code === 0) {
                        console.log("解散成功");
                    }
                });
            }
        }

        const options = wx.getLaunchOptionsSync();
        if (options.query.roomId) {
            console.log('未登录邀请:', options.query.roomId);
            Global.newFriendPlayer = options;
            if (Global._initialized) {
                check(options);
            } else {
                cc.director.on('MGOBE-Init', () => { check(options); });
            }

        }

        this.perloadView();



        cc.director.on('MGOBE-fail', () => {
            this.initSDK();
        });

        cc.director.on('back-mainView', this.backMainView, this);
        cc.director.on('play-start', this.playViewShow, this);
        // cc.director.on('setUserInfo', this.setUserInfo, this);
        cc.director.on('updateUserInfo', () => {
            this.score.string = t("积分：") + Global.score;
            this.accuracy.string = t("答题比拼正确率：") + Global.accuracy + "%";
        });

        cc.director.on('SettlementView-show', (ev) => {
            let data = ev.detail.data;
            this.settlementViewShow(data);
        });

        cc.director.on('jump-personal', (ev) => {
            setTimeout(() => {
                this.personalBtnClick();
            }, 500);
        });

        cc.director.on('timeout-line', this.offLine, this);
        cc.director.on('matching-show', this.matchingBtnClick, this);


        const offL = () => {
            this.offLine();
        }

        wx.getNetworkType({
            success(res) {
                const networkType = res.networkType
                if (networkType === 'none') {
                    console.log("网络断开，请检查网络状态");
                    offL();
                }
            }
        })

        wx.onNetworkStatusChange(res => {
            console.log("是否有网络连接", res.isConnected)
            console.log("网络连接类行为", res.networkType)
            if (!res.isConnected) {
                this.offLine();
                this.backMainView();
            }
            if (res.isConnected) {
                this.prompt.active = false;
            }
        })


        // const options = wx.getLaunchOptionsSync();
        // if (options.query.roomId) {
        //     console.log('JOIN FRIEND PVP:', options.query.roomId);
        //     this.joinFriendPvp(options.query.roomId, options);
        // }

        wx.onShow(ev => {
            console.log('SHOW:', ev);
            console.log('JOIN FRIEND PVP:', ev.query);
            if (ev.query.roomId) {
                console.log('JOIN FRIEND PVP:', ev.query);
                if (ev.query.hostId !== Global.playerId) {
                    console.log("不是房主", Global.playerId);
                    if (Global.playerView) { Global.playerView.destroy(); }
                    this.joinFriendPvp(ev.query.roomId, ev);
                } else {
                    console.log("是房主", Global.playerId);
                    if (Global.matchView) { Global.matchView.destroy(); }

                    Global.room.dismissRoom({}, event => {
                        if (event.code === 0) {
                            console.log("解散成功");
                        }
                    });
                }
            }
            if (Global.options.music === 'on' && Global.bgm) {
                console.log("音乐开启");
                setTimeout(() => {
                    // Global.bgm.volume = 0.2;
                    Global.bgm.play();
                    console.log("音乐延时播放");

                }, 500);
            }
        });
        wx.onHide(ev => {
            if (Global.bgm) {
                console.log("音乐隐藏");
                Global.bgm.pause();
                // Global.bgm.volume = 0;
            }
        })

        wx.showShareMenu({
            withShareTicket: true
        })


    }

    start() {
        console.log('Gamescene.start');
        this.bg.height = cc.winSize.height;
        this.loadingBg.height = cc.winSize.height;
        this.settingBg.height = cc.winSize.height;
        this.viewNode.height = cc.winSize.height;

        this.bottomNode.y = -(cc.winSize.height / 2 - 120);

        //动效
        this.animLoad();
        this.setUserInfo();
        wx.onShareAppMessage(() => {
            return {
                title: t('大家都在玩的防疫知识游戏，你也快来玩吧！'),
                imageUrl: 'https://mgobe-1258556906.file.myqcloud.com/GameAssets/shareImg/share-now.png' // 图片 URL
            }
        })

    }

    animLoad() {
        cc.loader.loadRes("/Effect/Prefab/QQfamily_effect", (err, prefab) => {
            if (err) {
                this.animLoad();
            } else {
                let anim = cc.instantiate(prefab);
                anim.getComponent(cc.Animation).play('QQfamily_effect');
                this.anims.addChild(anim, 102);
            }
        });
    }

    setUserInfo() {
        if (Global.userInfo && Global.userInfo.avatarUrl !== '' && Global.userInfo.avatarUrl !== 'q123') {
            cc.loader.load({ url: Global.userInfo.avatarUrl, type: 'png' }, (err, texture) => {
                console.log(texture);
                var sprite = new cc.SpriteFrame(texture);
                this.head.getComponent(cc.Sprite).spriteFrame = sprite;
            });
        } else {
            //qi e 
            this.head.getComponent(cc.Sprite).spriteFrame = this.headSpriteFrame;
        }
        // console.log('CLOUD FUNC:', Global.cloudFunc);
    }

    initSDK() {
        wx.cloud.callFunction({
            name: "f0_test_getConfig",
            data: { lng: "en" },
            success: res => {
                Global.gameId = res.result.gameInfo.gameId;
                Global.secretKey = res.result.gameInfo.secretKey;
                Global.server = res.result.gameInfo.url;
                Global.cloudFunc = res.result.func;
                Global.matchCode = res.result.gameInfo.match1v1;
                audio('bgm', 'bgm');
                wx.cloud.callFunction({
                    name: Global.cloudFunc.getUserInfo[Math.round(Math.random() * (Global.cloudFunc.getUserInfo.length - 1))],
                    success: res => {
                        console.log("getUserInfo res", res);
                        Global.openId = res.result.openId;
                        Global.score = res.result.score;
                        Global.accuracy = res.result.accuracy;
                        if (res.result.testRes) {
                            Global.assesment = JSON.parse(res.result.testRes);
                        }
                        this.score.string = t("积分：") + res.result.score;
                        this.accuracy.string = t("答题比拼正确率：") + res.result.accuracy + "%";
                        // const ev = new cc.Event.EventCustom('updateUserInfo', false);
                        // cc.director.dispatchEvent(ev);
                        Global.init();
                        this.loadingNode.active = false;
                    },
                    fail: err => {
                        console.error(err);
                    },
                });

            },
            fail: err => {
                console.error(err);
            },
        });
    }
    perloadView() {
        this.loadingProgram();
        let load = (id) => {
            switch (id) {
                case 0:
                    cc.loader.loadRes("Prefab/ExplanationUI", (err, prefab) => {
                        if (err) {
                            load(0);
                        } else {
                            // endTime1 = Date.now();
                            // console.log("预加载0时间", endTime1 - startTime);
                            load(1);
                        }
                    });
                    break;
                case 1:
                    cc.loader.loadRes("Prefab/PlayView", (err, prefab) => {
                        if (err) {
                            load(1)
                        } else {
                            // endTime2 = Date.now();
                            // console.log("预加载1时间", endTime2 - endTime1);
                            load(2);
                        }
                    });
                    break;
                case 2:
                    cc.loader.loadRes("Prefab/PersonalView", (err, prefab) => {
                        if (err) {
                            load(2)
                        } else {
                            // endTime3 = Date.now();
                            // console.log("预加载2时间", endTime3 - endTime2);
                            load(3)
                        }
                    });
                    break;
                case 3:
                    cc.loader.loadRes("Prefab/ResultsView", (err, prefab) => {
                        if (err) {
                            load(3)
                        } else {
                            // endTime4 = Date.now();
                            // console.log("预加载3时间", endTime4 - endTime3);
                            load(4)
                        }
                    });
                    break;
                case 4:
                    cc.loader.loadRes("Prefab/SettlementView", (err, prefab) => {
                        if (err) {
                            load(4)
                        } else {
                            // endTime5 = Date.now();
                            // console.log("预加载4时间", endTime5 - endTime4);
                            load(5)
                        }
                    });
                    break;
                case 5:
                    cc.loader.loadRes("Prefab/Leaderboard", (err, prefab) => {
                        if (err) {
                            load(5)
                        } else {
                            // endTime6 = Date.now();
                            // console.log("预加载5时间", endTime6 - endTime5);
                            // load(6)
                            console.log("预加载完成")
                            // this.loadingNode.active = false;
                        }
                    });
                    break;
                case 6:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(6)
                        } else {
                            // endTime7 = Date.now();
                            // console.log("预加载6时间", endTime7 - endTime6);
                            load(7)
                        }
                    });
                    break;
                case 7:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(7)
                        } else {
                            // endTime8 = Date.now();
                            // console.log("预加载7时间", endTime8 - endTime7);
                            load(8)
                        }
                    });
                    break;
                case 8:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(8)
                        } else {
                            // endTime9 = Date.now();
                            // console.log("预加载8时间", endTime9 - endTime8);
                            load(9)
                        }
                    });
                    break;
                case 9:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(9)
                        } else {
                            // endTime10 = Date.now();
                            // console.log("预加载9时间", endTime10 - endTime9);
                            load(10)
                        }
                    });
                    break;
                case 10:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(10)
                        } else {
                            // endTime11 = Date.now();
                            // console.log("预加载10时间", endTime11 - endTime10);
                            load(11)
                        }
                    });
                    break;
                case 11:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(11)
                        } else {
                            // endTime12 = Date.now();
                            // console.log("预加载11时间", endTime12 - endTime11);
                            load(12)
                        }
                    });
                    break;
                case 12:
                    cc.loader.loadRes("Prefab/", (err, prefab) => {
                        if (err) {
                            load(12)
                        } else {
                            console.log("预加载完成");

                        }
                    });
                    break;
            }
        }
        load(0);
    }

    playViewShow() {
        cc.loader.loadRes("Prefab/PlayView", (err, prefab) => {
            if (err) {
                this.playViewShow();
            } else {
                let playView = cc.instantiate(prefab);
                playView.getComponent('PlayView').init();
                this.viewNode.addChild(playView, 102);
                // this.hideLoading();
            }
        });
    }

    matchingBtnClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            cc.loader.loadRes("Prefab/MatchView", (err, prefab) => {
                if (err) {
                    this.matchingBtnClick();
                } else {
                    let matchView = cc.instantiate(prefab);
                    if (Global._initialized) {
                        matchView.getComponent('MatchView').init();
                    } else {
                        cc.director.on('MGOBE-Init', () => { matchView.getComponent('MatchView').init(); });
                    }
                    this.viewNode.addChild(matchView, 102);
                    // this.hideLoading();
                    cc.loader.loadRes("Prefab/PlayView", (err, prefab) => {

                    });
                }
            });
        }
    }

    personalBtnClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            console.log("个人评测");
            audio('button', null);

            audio('personalBgm', 'bgm2');

            if (Global.assesment.score >= 0) {
                this.showResultsView();
            } else {
                this.showPersonalView();
            }
        }
    }

    showPersonalView() {
        this.personalButton.interactable = false;
        cc.loader.loadRes("Prefab/PersonalView", (err, prefab) => {
            this.personalButton.interactable = true;
            if (err) {
                this.personalBtnClick();
            } else {
                let personalView = cc.instantiate(prefab);
                personalView.active = true;
                this.viewNode.addChild(personalView, 102);
                // this.hideLoading();
            }
        });
    }

    showResultsView() {
        cc.loader.loadRes("Prefab/ResultsView", (err, prefab) => {
            if (err) {
                this.personalBtnClick();
            } else {
                let instance = cc.instantiate(prefab);
                instance.active = true;
                this.viewNode.addChild(instance, 102);
                // this.hideLoading();
            }
        });
    }

    joinFriendPvp(roomId, ev) {
        if (Global._initialized) {
            this._joinFriendPvp(roomId, ev);
        } else {
            cc.director.on('MGOBE-Init', () => { this._joinFriendPvp(roomId, ev) });
        }
    }

    _joinFriendPvp(roomId, ev) {
        cc.loader.loadRes("Prefab/MatchView", (err, prefab) => {
            if (err) {
                this._joinFriendPvp(roomId, ev);
            } else {
                let matchView = cc.instantiate(prefab);
                this.viewNode.addChild(matchView, 102);
                matchView.getComponent('MatchView').init();
                matchView.getComponent('MatchView').joinRoom(roomId, ev);

                // this.hideLoading();
            }
        });
    }

    settlementViewShow(data) {
        cc.loader.loadRes("Prefab/SettlementView", (err, prefab) => {
            if (err) {
                this.settlementViewShow(data);
            } else {
                let settlementView = cc.instantiate(prefab);
                settlementView.getComponent('SettlementView').init(data);
                this.viewNode.addChild(settlementView, 102);
                // this.hideLoading();
            }
        });
    }


    loadingProgram() {
        cc.tween(this.loadingIcon).to(30, { rotation: 10800 })
            .start();
    }

    onLeaderboardButtonClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            console.log('Leaderboard button clicked');
            if (this._shouldLoadLeaderBoard) {
                this._shouldLoadLeaderBoard = false;
                const button = this.node.getChildByName('LeaderboardButton');
                button.getComponent(cc.Button).interactable = false;
                cc.loader.loadRes("Prefab/Leaderboard", (err, prefab) => {
                    button.getComponent(cc.Button).interactable = true;
                    if (err) {
                        console.error(err)
                    } else {
                        this._leaderboard = cc.instantiate(prefab);
                        this.viewNode.addChild(this._leaderboard);
                    }
                });
            } else {
                if (this._leaderboard) { this._leaderboard.active = true; }
            }
        }
    }

    backMainView() {
        audio('bgm', 'bgm');

        if (Global.personalView) { Global.personalView.destroy(); }
        if (Global.matchView) { Global.matchView.destroy(); }
        if (Global.resultView) { Global.resultView.destroy(); }
        if (Global.settlementView) { Global.settlementView.destroy(); }
        if (Global.playerView) { Global.playerView.destroy(); }
    }

    h5NowTime() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            let path = 'pages/index/home/main?navigate_uri=%2Fpages%2Fwebview%2Fmain%3Fsrc%3Dhttps%253A%252F%252Ffeiyan.wecity.qq.com%252Fwuhan%252Fdist%252Findex.html%2523%252Findex%253F_scope%253Dsnsapi_base%2526channel%253DAAE1TCydH5eusJvAkQrqHafG&channel=AAE1TCydH5eusJvAkQrqHafG'
            this.h5Jump(path);
        }
    }

    h5Query() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            let path = 'pages/index/home/main?navigate_uri=%2Fpages%2Fwebview%2Fmain%3Fsrc%3Dhttps%253A%252F%252Ffeiyan.wecity.qq.com%252Fwuhan%252Fdist%252Findex.html%2523%252Fselftest%253Ffrom%253Dlung%2526_scope%253Dsnsapi_userinfo%2526channel%253DAAE1TCydH5eusJvAkQrqHafG&channel=AAE1TCydH5eusJvAkQrqHafG'
            this.h5Jump(path);
        }
    }

    h5Strategy() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            let path = 'pages/index/home/main?navigate_uri=%2Fpages%2Fwebview%2Fmain%3Fsrc%3Dhttps%253A%252F%252Ffeiyan.wecity.qq.com%252Fwuhan%252Fdist%252Findex.html%2523%252Ffacemask-apply%253F_scope%253Dsnsapi_base%2526channel%253DAAE1TCydH5eusJvAkQrqHafG&channel=AAE1TCydH5eusJvAkQrqHafG'
            this.h5Jump(path);
        }
    }

    h5Community() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            audio('button', null);

            let path = 'pages/index/home/main?navigate_uri=%2Fpages%2Fwebview%2Fmain%3Fsrc%3Dhttps%253A%252F%252Ffeiyan.wecity.qq.com%252Fwuhan%252Fdist%252Findex.html%2523%252Ffeiyan-act%253F_scope%253Dsnsapi_base%2526zoom%253D12%2526channel%253DAAE1TCydH5eusJvAkQrqHafG&channel=AAE1TCydH5eusJvAkQrqHafG'
            this.h5Jump(path);
        }
    }

    h5Jump(path) {
        console.log("H5外链");
        wx.navigateToMiniProgram({
            appId: 'wxb032bc789053daf4',
            path: path,
            success(res) {
                // 打开成功
                console.log("打开成功");

            },
            fail(res) {
                console.error('跳转失败')
            }
        })
    }

    offLine() {
        this.prompt.active = true;
        this.prompt.opacity = 255;
        this.prompt.getChildByName("New Label").getComponent(cc.Label).string = "网络断开，请检查网络状态";
        // setTimeout(() => {
        //     cc.tween(this.prompt).to(3, { opacity: 0 })
        //         .start();
        // }, 3000);

    }

    settingBtnClick() {
        if (!this.btnState) {
            this.btnState = true;
            setTimeout(() => {
                this.btnState = false;
            }, 500);
            this.userIdLabel.string = Global.playerId;
            this.settingNode.active = true;
        }
    }

    settingUnshow() {
        this.settingNode.active = false;
    }

    switchEffect() {
        if (Global.options.sound === 'on') {
            Global.options.sound = 'off';
            this.effectBtn.spriteFrame = this.btnSpriteFrame[1];
        } else {
            Global.options.sound = 'on';
            this.effectBtn.spriteFrame = this.btnSpriteFrame[0];
        }
    }

    switchBgm() {
        if (Global.options.music === 'on') {
            Global.options.music = 'off';
            this.bgmBtn.spriteFrame = this.btnSpriteFrame[1];
        } else {
            Global.options.music = 'on';
            this.bgmBtn.spriteFrame = this.btnSpriteFrame[0];
        }
        bgmSwitch();
    }

    switchSound() {
        if (Global.options.music === 'on' && Global.options.sound === 'on') {
            Global.options.music = 'off';
            Global.options.sound = 'off';
            this.soundBtn.spriteFrame = this.soundSpriteFrame[1];
        } else {
            Global.options.music = 'on';
            Global.options.sound = 'on';
            this.soundBtn.spriteFrame = this.soundSpriteFrame[0];
        }
        bgmSwitch();
    }

    // update (dt) {}

    onTestButtonClick() {
        this.testScore++;
        LeaderboardManager.instance.reportScore(this.testScore, 97);
    }
}
