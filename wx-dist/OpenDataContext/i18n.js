const i18nMap = {
    en: {
        "积分：": "Score: ",
        "答题比拼正确率：": "Correct Answer Rate: ",
        "大家都在玩的防疫知识游戏，你也快来玩吧！": "This fun mini game can help you learn a lot about how to prevent COVID-19. Let's get started.",
        "一起来战疫分享": "This fun mini game can help you learn a lot about how to prevent COVID-19. Let's get started.",
        "一起来战疫答题": "Challenge me on COVID-19 prevention knowledge!",
        "一起来战疫奖状": "This fun mini game can help you learn a lot about how to prevent COVID-19. Let's get started.",
        "正确率": "Right",
        "正确率：": "Right: ",
        "错误率": "Wrong",
        "第${0}题": "Question ${0}",
        "这个好玩的小游戏，还能学到不少防疫知识，快上车！": "This fun mini game can help you learn a lot about how to prevent COVID-19. Let's get started.",
        "比拼正确率": "Correct Answer Rate",
        "匹配中": "Pairing",
        "秒": "seconds",
        "匹配失败，请重新匹配": "Pairing failed, please try again.",
        "快来和我PK防疫知识！": "Challenge me on COVID-19 prevention knowledge!",
        "正确${0}题": "Correct: ${0}",
        "错误${0}题": "Incorrect: ${0}",
        "你的防疫知识很好哦": "You have good knowledge of COVID-19 prevention.",
        "你需要加强防疫知识哦": "You need to improve your COVID-19 prevention knowledge.",
        "加载中": "Loading",
    }
}

function t(str) {
    if (i18nMap.en[str]) {
        return i18nMap.en[str];
    }

    console.log(">>", str);

    return str;
}

function c(str, arr) {
    arr.forEach((v, i) => {
        str = str.replace("${" + i + "}", v);
    });

    return str;
}

exports.t = t;
exports.c = c;