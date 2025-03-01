require('./libs/wrapper/builtin/index');
window.DOMParser = require('./libs/common/xmldom/dom-parser').DOMParser;
require('./libs/common/engine/globalAdapter/index');
require('./libs/wrapper/unify');
require('./libs/wrapper/systemInfo');

require('./FirstFrame');
window.FirstFrame.renderFirstFrame();


// Ensure getting the system info in open data context
window.__globalAdapter.init(function () {
    require('./src/settings.f4dd8');
    // Will be replaced with cocos2d-js path in editor
    require('cocos/cocos2d-js-min.js');
    require('./libs/common/engine/index');
    require('./main.4caff');
    require('./libs/common/remote-downloader');

    // Adjust devicePixelRatio
    cc.view._maxPixelRatio = 4;

    // downloader polyfill
    window.wxDownloader = remoteDownloader;
    // handle remote downloader
    remoteDownloader.REMOTE_SERVER_ROOT = "https://mgobe-1258556906.file.myqcloud.com/QQGameAssets/archy_test";
    remoteDownloader.SUBCONTEXT_ROOT = "";
    var pipeBeforeDownloader = cc.loader.subPackPipe || cc.loader.md5Pipe || cc.loader.assetLoader;
    cc.loader.insertPipeAfter(pipeBeforeDownloader, remoteDownloader);

    if (cc.sys.platform === cc.sys.WECHAT_GAME_SUB) {
        var SUBDOMAIN_DATA = require('src/subdomain.json.js');
        cc.game.once(cc.game.EVENT_ENGINE_INITED, function () {
            cc.Pipeline.Downloader.PackDownloader._doPreload("SUBDOMAIN_DATA", SUBDOMAIN_DATA);
        });

        require('./libs/wrapper/sub-context-adapter');
    }
    else {
        // Release Image objects after uploaded gl texture
        cc.macro.CLEANUP_IMAGE_CACHE = true;
    }

    remoteDownloader.init();
    window.boot();
});