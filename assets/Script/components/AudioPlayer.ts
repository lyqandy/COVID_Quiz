
import Global from "../Global";

const audioFile = {};


const data = {
    bgm: 'Audio/bgm1',
    personalBgm: 'Audio/bgm2',
    competeBgm: 'Audio/bgm3',
    button: 'Audio/button',
    right: 'Audio/right',
    wrong: 'Audio/wrong',
};

export function initAudio(){
    Global.bgm = wx.createInnerAudioContext();
    console.log("音乐管件初始化");
}

export function audio(id, type) {
    let a = 0;
    // cc.audioEngine.setMusicVolume(0.2);
    if (type) {
        if (Global.options.music === 'off') return;
        if (Global.bgm) {
            Global.bgm.destroy();
            Global.bgm = wx.createInnerAudioContext();
        }
        let bgmId = null;
        switch (type) {
            case "bgm":
                bgmId = "58E772961AA8DD0D5569BB40AF7AEF08"
                break;
            case "bgm2":
                bgmId = "9449E8749DA56A525569BB40AF7AEF08"
                break;
            case "bgm3":
                bgmId = "B98A88F7F1BA76155569BB40AF7AEF08"
                break;

            default:
                break;
        }
        console.log("背景音乐加载");

        playMuisc(bgmId, type);
        console.log("背景音乐播放");

    } else {
        if (Global.options.sound === 'off') return;

        if (audioFile[id]) {
            console.log("音效直接播放");
            cc.audioEngine.playEffect(audioFile[id], false);
        } else {
            this.load(id);
        }
    }



    function playMuisc(i, type) {
        // if (Global.bgm) {
        //     Global.bgm.pause();
        // }
        wx.cloud.callFunction({
            name: Global.cloudFunc.getBgm[Math.round(Math.random() * (Global.cloudFunc.getBgm.length - 1))],
            data: {
                bgmId: i
            },
            success: res => {
                let Bgmurl = res.result.url;
                console.log("音乐url", Bgmurl);

                if (Global.options.music === 'on') {
                    Global.bgm.loop = true;
                    // Global.bgm.volume = 0.2;
                    if (audioFile[type]) {
                        Global.bgm.src = audioFile[type];
                        // Global.bgm.src = ''
                        Global.bgm.play();
                    } else {
                        wx.downloadFile({
                            url: Bgmurl,
                            success(res) {
                                console.log("downloadFile", res);
                                audioFile[type] = res.tempFilePath;
                                Global.bgm.src = res.tempFilePath;
                                // Global.bgm.src = ''
                                Global.bgm.play();
                            },
                            fail(res) {
                                console.error("下载音乐资源有误", res)
                            }
                        });
                    }
                    Global.bgm.onError((res) => {
                        console.log("音乐播放报错");
                        console.log(res.errMsg)
                        console.log(res.errCode)
                    })
                }
            },
            fail: err => {
                console.error(err);
            },
        });

    }
}


export function bgmSwitch() {
    // self.bgm.mute = type
    // if (type) {
    if (Global.options.music === 'off') {
        if (Global.bgm) {
            Global.bgm.pause();
        }
    } else {
        if (Global.bgm) {
            Global.bgm.play();
        }
    }
    // }
}

export function load(id, type) {
    let musicId = null;
    // if (Global.iswechatgame) {
    //     if (type === 'music') {
    //         this.playMuisc();
    //     } else {
    //         this.play(id);
    //     }
    //     // return;
    // } else {
    // if (type) {
    //     if (Global.audioId) {
    //         cc.audioEngine.stopAll();
    //     }
    //     console.log("背景音乐");

    //     cc.loader.loadRes(data[id], (err, file) => {
    //         if (file instanceof cc.AudioClip) {
    //             audioFile[id] = file;
    //             musicId = id;
    //             var bgmId = cc.audioEngine.playMusic(audioFile[id], true);
    //             Global.audioId = bgmId;
    //         }
    //     });
    //     cc.audioEngine.setMusicVolume(0.2);

    // } else {
    // console.log("播放音效");

    cc.loader.loadRes(data[id], (err, file) => {
        if (file instanceof cc.AudioClip) {
            audioFile[id] = file;
            musicId = id;
            cc.audioEngine.playEffect(audioFile[id], false);
        }
    });
    // }

    // return;
    // }
}

export function play(id) {
    const audio = wx.createInnerAudioContext();
    // console.log(app.assets.getAssetById(slot._asset)._file.url)
    audio.src = 'https://cdn.landintheair.com/host_factory/' + data[id];
    audio.play();
}




