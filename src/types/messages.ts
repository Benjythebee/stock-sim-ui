import type { GameSettings } from "../context/game.context";
import type { PowerDescription } from "./types";


export enum MessageType {
    ID =-1,
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
    NOTIFICATION = 15,
    CLIENT_STATE = 16,
    ORDER_BOOK_UPDATE= 17,
    CONTENT_MANIFEST = 18,
    ORDER_UPDATE = 19,
    ORDER_CANCEL = 20,

    ADMIN_SETTINGS = 30,

    GAME_CONCLUSION = 60,

    POWER_OFFERS=80,
    POWER_SELECT=81,
    POWER_CONSUME=82,
    POWER_INVENTORY=83,

    DEBUG_PRICES=99
}

export const MessageTypeNames: { [key in MessageType]: string } = {
    [MessageType.ID]: "ID",
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
    [MessageType.NOTIFICATION]: "NOTIFICATION",
    [MessageType.CLIENT_STATE]: "CLIENT_STATE",
    [MessageType.ORDER_BOOK_UPDATE]: "ORDER_BOOK_UPDATE",
    [MessageType.CONTENT_MANIFEST]: "CONTENT_MANIFEST",
    [MessageType.ORDER_UPDATE]: "ORDER_UPDATE",
    [MessageType.ORDER_CANCEL]: "ORDER_CANCEL",
    // Admin Messages - 30
    [MessageType.ADMIN_SETTINGS]: "ADMIN_SETTINGS",

    [MessageType.GAME_CONCLUSION]: "GAME_CONCLUSION",


    [MessageType.POWER_OFFERS]: "POWER_OFFERS",
    [MessageType.POWER_SELECT]: "POWER_SELECT",
    [MessageType.POWER_CONSUME]: "POWER_CONSUME",
    [MessageType.POWER_INVENTORY]: "POWER_INVENTORY",

    [MessageType.DEBUG_PRICES]: "DEBUG_PRICES"
};

type IDMessage = {
    type: MessageType.ID;
    id: string;
}

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
    /** Server -> client: the new absolute state. Omitted when the client sends the request. */
    paused?: boolean;
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

type NotificationMessage = {
    type: MessageType.NOTIFICATION;
    level: 'info' | 'warning' | 'error' | 'success';
    title: string;
    description?: string;
}

type ClientStateMessage = {
    type: MessageType.CLIENT_STATE;
    tradingDisabled: boolean;
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
        /** Cash/shares locked in open orders (not included in cash/shares). */
        reservedCash?: number;
        reservedShares?: number;
    };
}

type StockMovementMessage = {
    type: MessageType.STOCK_MOVEMENT;
    price: number;
}

type OrderBookUpdateMessage = {
    type: MessageType.ORDER_BOOK_UPDATE;
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

type PowerOffersMessage = {
    type: MessageType.POWER_OFFERS;
    offers: PowerDescription[]
}

/** `index` into the current offers, or POWER_SKIP_INDEX to decline the whole briefcase. */
type PowerSelectMessage = {
    type: MessageType.POWER_SELECT;
    index: number;
}
/** POWER_SELECT index that tells the server to discard the offers (so they aren't re-sent on reconnect). */
export const POWER_SKIP_INDEX = -1;

type PowerConsumeMessage = {
    type: MessageType.POWER_CONSUME;
    id: string;
}
/** Sent on connect: every installed power (incl. mods) and server-hosted assets to preload. */
type ContentManifestMessage = {
    type: MessageType.CONTENT_MANIFEST;
    powers: PowerDescription[];
    /** Server-relative URLs (prefix with the server origin). */
    assets: string[];
}

/** "partial": a market order that couldn't fill completely (the rest was dropped). */
type OrderStatus = 'open' | 'filled' | 'partial' | 'cancelled';

/** One of our own orders. "open" ones are the current orders, the rest are history. */
type OrderInfo = {
    /** Unique per player and game. */
    id: number;
    action: 'BUY' | 'SELL';
    orderType: 'LIMIT' | 'MARKET';
    /** Limit price in dollars; null for market orders. */
    price: number | null;
    quantity: number;
    filled: number;
    /** Average execution price; null until something fills. */
    avgPrice: number | null;
    status: OrderStatus;
    /** Game clock (epoch ms) when placed, and when it last changed. */
    time: number;
    updated: number;
}

/** Private. Orders that changed, to upsert by id; `reset` carries the full list (open + recent history). */
type OrderUpdateMessage = {
    type: MessageType.ORDER_UPDATE;
    orders: OrderInfo[];
    reset: boolean;
}

/** Cancel one of our open orders by OrderInfo.id, or all of them with ORDER_CANCEL_ALL. */
type OrderCancelMessage = {
    type: MessageType.ORDER_CANCEL;
    id: number;
}
export const ORDER_CANCEL_ALL = -1;

type PowerInventoryMessage = {
    type: MessageType.POWER_INVENTORY;
    inventory: string[]
}

export type Message = IDMessage|JoinMessage | LeaveMessage | IsShockMessage | ClientStateMessage|OrderBookUpdateMessage | NotificationMessage | RoomStateMessage | PortfolioUpdateMessage | TogglePauseMessage | NewsMessage | IsAdminMessage | AdminSettingMessage | ClockMessage | PingMessage | PongMessage | ChatMessage | ErrorMessage | StockMessage | StockMovementMessage | DebugPricesMessage | ConclusionMessage|
PowerOffersMessage | PowerSelectMessage | PowerConsumeMessage | PowerInventoryMessage | ContentManifestMessage | OrderUpdateMessage | OrderCancelMessage;

export type {
    IDMessage,
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
    ClientStateMessage,
    AdminSettingMessage,
    StockMovementMessage,
    IsShockMessage,
    PowerOffersMessage,
    PowerSelectMessage,
    PowerConsumeMessage,
    OrderBookUpdateMessage,
    PowerInventoryMessage,
    ContentManifestMessage,
    OrderStatus,
    OrderInfo,
    OrderUpdateMessage,
    OrderCancelMessage,
    DebugPricesMessage,
    ConclusionMessage
}