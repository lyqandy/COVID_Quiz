import Global from "../Global";

export default class base{

}

export interface Player {
	score: number,
	ans: number,
	sumScore: number,
	playerId: string,
	customStatus: number,
	customProfile: string,
	teamId: string,
	name: string,
}

export interface Que {
	tag: string,
	que: string,
	opt: string[],
	ans: number,
}

export interface GameState {
	playerGroup: [Player[], Player[]],
	que: Que,
	time: number,
	finish: boolean,
	curQueId: number,
}

export interface SerPushMsg {
	cmd: SER_PUSH_CMD,
	err: string,
	gameState: GameState,
}

export enum SER_PUSH_CMD {
	CURRENT = 1,
	GAME_STEP = 2,
	ERR = 3,
}

export const CMD = {
	READY: "READY",
	SUBMIT: "SUBMIT",
	CURRENT: "CURRENT",
}