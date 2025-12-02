import type { GameSettings } from "../context/game.context";


export enum MessageType {
    JOIN = 0,
    LEAVE = 1,
    IS_ADMIN=2,
    TOGGLE_PAUSE=3,
    MESSAGE = 4,
    ERROR = 5,
    PING = 6,
    PONG = 7,
    CLOCK = 8,
    ROOM_STATE = 9,
    STOCK_ACTION = 10,
    STOCK_MOVEMENT = 11,
    PORTFOLIO_UPDATE = 12,
    SHOCK = 13,
    NEWS = 14,

    ADMIN_SETTINGS = 30,

    GAME_CONCLUSION = 60,

    DEBUG_PRICES=99
}

export const MessageTypeNames: { [key in MessageType]: string } = {
    [MessageType.JOIN]: "JOIN",
    [MessageType.LEAVE]: "LEAVE",
    [MessageType.IS_ADMIN]: "IS_ADMIN",
    [MessageType.TOGGLE_PAUSE]: "TOGGLE_PAUSE",
    [MessageType.MESSAGE]: "MESSAGE",
    [MessageType.ERROR]: "ERROR",
    [MessageType.PING]: "PING",
    [MessageType.PONG]: "PONG",
    [MessageType.CLOCK]: "CLOCK",
    [MessageType.ROOM_STATE]: "ROOM_STATE",
    [MessageType.STOCK_ACTION]: "STOCK_ACTION",
    [MessageType.STOCK_MOVEMENT]: "STOCK_MOVEMENT",
    [MessageType.PORTFOLIO_UPDATE]: "PORTFOLIO_UPDATE",
    [MessageType.SHOCK]: "SHOCK",
    [MessageType.NEWS]: "NEWS",
    // Admin Messages - 30
    [MessageType.ADMIN_SETTINGS]: "ADMIN_SETTINGS",

    [MessageType.GAME_CONCLUSION]: "GAME_CONCLUSION",

    [MessageType.DEBUG_PRICES]: "DEBUG_PRICES"
};


type JoinMessage = {
    type: MessageType.JOIN;
    roomId: string;
    username: string;
    id: string;
}

type LeaveMessage = {
    type: MessageType.LEAVE;
    roomId: string;
    id: string;
}

type IsAdminMessage = {
    type: MessageType.IS_ADMIN;
}

type IsShockMessage = {
    type: MessageType.SHOCK;
    target:'intrinsic'|'market'
}
type RoomStateMessage = {
    type: MessageType.ROOM_STATE;
    paused: boolean;
    started: boolean;
    ended: boolean;
    settings: GameSettings;
    roomId: string;
    clock: number;
    clients: number;
    price: number;
}

type TogglePauseMessage = {
    type: MessageType.TOGGLE_PAUSE;
}
type PingMessage = {
    type: MessageType.PING;
}

type PongMessage = {
    type: MessageType.PONG;
}

type ChatMessage = {
    type: MessageType.MESSAGE;
    roomId: string;
    id: string;
    content: string;
}

type ErrorMessage = {
    type: MessageType.ERROR;
    message: string;
}

type NewsMessage = {
    type: MessageType.NEWS;
    title: string;
    timestamp: number;
    description: string;
    durationTicks: number;
}

type ClockMessage = {
    type: MessageType.CLOCK;
    value: number;
    timeLeft: number;
}
type AdminSettingMessage = {
    type: MessageType.ADMIN_SETTINGS;
    settings: Partial<GameSettings>;
}

type StockMessage = {
    type: MessageType.STOCK_ACTION;
    action: 'BUY' | 'SELL';
    orderType: 'LIMIT' | 'MARKET';
    quantity: number;
    price: number;
}

type PortfolioUpdateMessage = {
    type: MessageType.PORTFOLIO_UPDATE;
    id: string;
    value: {
        cash: number;
        pnl: number;
        shares: number;
    };
}

type StockMovementMessage = {
    type: MessageType.STOCK_MOVEMENT;
    price: number;
    depth: [[number, number][], [number, number][]]
}

type ConclusionMessage = {
    type: MessageType.GAME_CONCLUSION;
    players: ({ name: string } & PortfolioUpdateMessage['value'])[];
    bots: ({ name: string, type: string } & PortfolioUpdateMessage['value'])[];
    volumeTraded: number;
    highestPrice: number;
    lowestPrice: number;
}

type DebugPricesMessage = {
    type: MessageType.DEBUG_PRICES;
    intrinsicValue: number;
    guidePrice: number;
}

export type Message = JoinMessage | LeaveMessage | IsShockMessage | RoomStateMessage | PortfolioUpdateMessage | TogglePauseMessage | NewsMessage | IsAdminMessage | AdminSettingMessage | ClockMessage | PingMessage | PongMessage | ChatMessage | ErrorMessage | StockMessage | StockMovementMessage | DebugPricesMessage | ConclusionMessage;

export type {
    JoinMessage,
    LeaveMessage,
    PingMessage,
    RoomStateMessage,
    TogglePauseMessage,
    IsAdminMessage,
    PongMessage,
    ClockMessage,
    ChatMessage,
    NewsMessage,
    ErrorMessage,
    StockMessage,
    PortfolioUpdateMessage,
    AdminSettingMessage,
    StockMovementMessage,
    IsShockMessage,
    DebugPricesMessage,
    ConclusionMessage
}