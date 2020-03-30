
declare var wx: any;

interface ShareParams {
    type?: string;
    title?: string;
    imageUrl?: string;
    query?: any;
};

const defaultParams: ShareParams = {
    type: 'normal',
    title: t('一起来战疫分享'),
    imageUrl: 'https://mgobe-1258556906.file.myqcloud.com/GameAssets/shareImg/share-now.png',
    query: ''
};

const defaultParamsinvitation: ShareParams = {
    type: 'normal',
    title: t('一起来战疫答题'),
    imageUrl: 'https://mgobe-1258556906.file.myqcloud.com/GameAssets/shareImg/share-vs1.png',
    query: ''
};

const defaultParamsPersonal: ShareParams = {
    type: 'normal',
    title: t('一起来战疫奖状'),
    imageUrl: 'https://mgobe-1258556906.file.myqcloud.com/GameAssets/shareImg/share-testimonials.png',
    query: ''
};

export function invitation(params: ShareParams, timeout: number = 3000) {

    for (let key in defaultParamsinvitation) {
        if (!params.hasOwnProperty(key)) {
            params[key] = defaultParamsinvitation[key];
        }
    }

    if (typeof params.query === 'object') {
        params.query = encodeQuery(params.query);
    }

    wx.shareAppMessage(params);

    let shareCompleted: boolean = false;
    const handle = setTimeout(() => shareCompleted = true, timeout);

    return new Promise((resolve, reject) => {
        cc.director.once('show', () => {
            clearTimeout(handle);
            if (shareCompleted) {
                resolve();
            } else {
                reject();
            }
        });
    });
};

export function share(params: ShareParams, timeout: number = 3000) {

    for (let key in defaultParams) {
        if (!params.hasOwnProperty(key)) {
            params[key] = defaultParams[key];
        }
    }

    if (typeof params.query === 'object') {
        params.query = encodeQuery(params.query);
    }

    wx.shareAppMessage(params);

    let shareCompleted: boolean = false;
    const handle = setTimeout(() => shareCompleted = true, timeout);

    return new Promise((resolve, reject) => {
        cc.director.once('show', () => {
            clearTimeout(handle);
            if (shareCompleted) {
                resolve();
            } else {
                reject();
            }
        });
    });
};

export function personalShare(params: ShareParams, timeout: number = 3000) {

    for (let key in defaultParamsPersonal) {
        if (!params.hasOwnProperty(key)) {
            params[key] = defaultParamsPersonal[key];
        }
    }

    if (typeof params.query === 'object') {
        params.query = encodeQuery(params.query);
    }

    wx.shareAppMessage(params);

    let shareCompleted: boolean = false;
    const handle = setTimeout(() => shareCompleted = true, timeout);

    return new Promise((resolve, reject) => {
        cc.director.once('show', () => {
            clearTimeout(handle);
            if (shareCompleted) {
                resolve();
            } else {
                reject();
            }
        });
    });
};

function encodeQuery(query: any) {
    let s = [];

    for (let key in query) {
        s.push(`${key}=${query[key]}`);
    }

    return s.join('&');
}

export function shareBackup(params) {
    /*
    * type: ‘normal’ || ‘award’ 分享到群 
    * title: 标题
    * query: 分享参数
    * img: 分享图片
    * call： 回掉
    */
        wx.shareAppMessage({
            title: params.title || '这球能进吗？ 在线等，挺急的!',
            query: params.query || '',
            imageUrl: params.img || "https://skyspread.landintheair.com/img/billiards-share.png",
            success: function (res) {
                console.log(res);
                if (params.type === 'award') {
                    if (res.shareTickets) {
                        console.log('分享到微信群')
                        params.call();
                    }
                } else {

                }

                if (typeof params.success === 'function') {
                    params.success(res);
                }
            },
            fail: function (res) {
                console.log('分享失败', res);
                if (typeof params.success === 'function') {
                    params.success(res);
                }
            }
        });
}
