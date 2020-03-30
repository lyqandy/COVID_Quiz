/// <reference path="../../MGOBE.d.ts" />

import "./libs/i18n";
import '../Script/libs/MGOBE';
import { GameState, Player } from "../Script/libs/base";

interface UserInfo {
	nickName: string,
	gender: number,
	language: string,
	city: string,
	province: string,
	country: string,
	avatarUrl: string,
}

class Global {
	room: MGOBE.Room = null;
	public userInfo: UserInfo;
	public otherNickName = null;
	public otherAvatarUrl = null;
	public openId: string;
	public playerId: string;
	public gameId: string;
	public secretKey: string;
	public server: string;
	public gameState: boolean = false;
	public assesment = {
		questions: [],
		mistakes: [],
		score: -1,
	};
	public newFriendPlayer = null;

	public cloudFunc: {
		getRank: Array<any>,
		getTestQuestions: Array<any>,
		getUserInfo: Array<any>,
		getBgm: Array<any>,
		saveTestRes: Array<string>
	} = null;
	// 匹配Code
	public matchCode: string = null;

	public score = 0;
	public accuracy = 0;
	_initialized = false;
	bgm = null;
	options = {
		sound: 'on',
		music: 'on',
	};
	iswechatgame: boolean = true;
	audioId: number = 0;
	ansS: boolean = null;
	ansS2: boolean = null;

	personalView: cc.Node = null;
	resultView: cc.Node = null;
	settlementView: cc.Node = null;
	playerView: cc.Node = null;
	matchView: cc.Node = null;

	init() {
		console.log("---------------openId", this.openId);

		const gameInfo = {
			// 替换 为控制台上的“游戏ID”
			gameId: this.gameId,
			// 玩家 openId
			openId: this.openId,
			// 替换 为控制台上的“游戏Key”
			secretKey: this.secretKey,
		};

		const config = {
			// 替换 为控制台上的“域名”
			url: this.server,
			reconnectMaxTimes: 5,
			reconnectInterval: 1000,
			resendInterval: 1000,
			resendTimeout: 10000,
		};

		this.room = new MGOBE.Room();

		// 初始化 Listener
		MGOBE.Listener.init(gameInfo, config, event => {
			if (event.code === 0) {
				console.log("初始化成功");
				// 初始化成功之后才能调用其他 API
				// ...
				MGOBE.Listener.add(this.room);
				this.playerId = MGOBE.Player.id;
				console.log("Global.playerId", this.playerId);


				const ev = new cc.Event.EventCustom('MGOBE-Init', false);
				cc.director.dispatchEvent(ev);
			} else {
				console.log("初始化失败");
				const ev = new cc.Event.EventCustom('MGOBE-fail', false);
				cc.director.dispatchEvent(ev);
			}
		});

		// 实例化 Room 对象
		// const room = new MGOBE.Room();
		this._initialized = true;


	}
}

const global = new Global();

export default global;

(window as any).Global = global;