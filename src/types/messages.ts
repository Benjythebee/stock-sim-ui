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
    RENAME = 21,
    PLAYERS = 22,
    LOAN_BORROW = 23,
    LOAN_REPAY = 24,
    STREAMER_MODE = 25,

    ADMIN_SETTINGS = 30,
    RESET_GAME = 31,

    GAME_CONCLUSION = 60,

    POWER_OFFERS=80,
    POWER_SELECT=81,
    POWER_CONSUME=82,
    POWER_INVENTORY=83,
    POWER_PRESENT=84,

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
    [MessageType.RENAME]: "RENAME",
    [MessageType.PLAYERS]: "PLAYERS",
    [MessageType.LOAN_BORROW]: "LOAN_BORROW",
    [MessageType.LOAN_REPAY]: "LOAN_REPAY",
    [MessageType.STREAMER_MODE]: "STREAMER_MODE",
    // Admin Messages - 30
    [MessageType.ADMIN_SETTINGS]: "ADMIN_SETTINGS",
    [MessageType.RESET_GAME]: "RESET_GAME",

    [MessageType.GAME_CONCLUSION]: "GAME_CONCLUSION",


    [MessageType.POWER_OFFERS]: "POWER_OFFERS",
    [MessageType.POWER_SELECT]: "POWER_SELECT",
    [MessageType.POWER_CONSUME]: "POWER_CONSUME",
    [MessageType.POWER_INVENTORY]: "POWER_INVENTORY",
    [MessageType.POWER_PRESENT]: "POWER_PRESENT",

    [MessageType.DEBUG_PRICES]: "DEBUG_PRICES"
};

/** `id` is `<roomId>-<resumeToken>`: our seat's secret, sent back as `prevSessionData` to resume it. */
type IDMessage = {
    type: MessageType.ID;
    id: string;
}

/** Broadcasts carry no player id. */
type JoinMessage = {
    type: MessageType.JOIN;
    roomId: string;
    username: string;
}

type LeaveMessage = {
    type: MessageType.LEAVE;
    roomId: string;
}

/** One human in the room (no id: the server keeps those private). */
type PlayerInfo = {
    name: string;
    /** False while their seat is held for a reconnect. */
    connected: boolean;
    host: boolean;
}

/** Everyone in the room, re-sent whole on any change. `you` is our index in `players`, -1 for spectators. */
type PlayersMessage = {
    type: MessageType.PLAYERS;
    players: PlayerInfo[];
    you: number;
    /** Someone in the room has streamer mode on, so it's on by default here too. Missing from older servers. */
    streamer?: boolean;
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
/** Host only, after the game ended: back to the lobby with the same settings. The server answers with ROOM_STATE started=false. */
type ResetGameMessage = {
    type: MessageType.RESET_GAME;
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
        /** Our outstanding bank loan, null when there is none. P&L is already net of it. */
        loan?: LoanInfo | null;
    };
}

/** A bank loan, in dollars. Repaying it now costs `principal + interest`. */
type LoanInfo = {
    principal: number;
    /** Interest accrued so far (it builds up linearly until the end of the game). */
    interest: number;
    /** Interest owed on what's left if it's kept to the end of the game, when the bank collects it. */
    maxInterest: number;
    /** Game clock (epoch ms) when it was taken. */
    time: number;
}

/** Take a bank loan of `settings.loanAmount` (one at a time, while running). */
type LoanBorrowMessage = {
    type: MessageType.LOAN_BORROW;
}

/**
 * Repay our loan ('all', the default) or half of what's left of it, plus the interest accrued so far,
 * from available cash. After a half repayment only the rest accrues interest.
 */
type LoanRepayMessage = {
    type: MessageType.LOAN_REPAY;
    portion?: 'all' | 'half';
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

/** Change our display name. The server keeps the first 32 characters and drops an empty name. */
type RenameMessage = {
    type: MessageType.RENAME;
    username: string;
}

/** Whether our own streamer mode is on (any phase). The server tells the room through PLAYERS.streamer. */
type StreamerModeMessage = {
    type: MessageType.STREAMER_MODE;
    on: boolean;
}

type PowerInventoryMessage = {
    type: MessageType.POWER_INVENTORY;
    inventory: string[]
}

/** One slice of a prize wheel. */
type WheelSegment = {
    label: string;
    /** CSS color of the slice; the UI picks one when omitted. */
    color?: string;
    /** Relative size of the slice (default 1). */
    weight?: number;
}

/** A prize wheel that spins for durationMs and lands on segments[result] (decided by the server). */
type WheelPresentation = {
    kind: 'wheel';
    segments: WheelSegment[];
    result: number;
    durationMs: number;
}

/** Animations a power can ask for. Kinds this UI doesn't know are ignored (the server also sends a NOTIFICATION). */
type Presentation = WheelPresentation;

/** Private. Play a power's animation; the outcome arrives as a normal NOTIFICATION once it's over. */
type PowerPresentMessage = {
    type: MessageType.POWER_PRESENT;
    powerId: string;
    title: string;
    presentation: Presentation;
}

export type Message = IDMessage|JoinMessage | LeaveMessage | IsShockMessage | ClientStateMessage|OrderBookUpdateMessage | NotificationMessage | RoomStateMessage | PortfolioUpdateMessage | TogglePauseMessage | NewsMessage | IsAdminMessage | AdminSettingMessage | ResetGameMessage | ClockMessage | PingMessage | PongMessage | ChatMessage | ErrorMessage | StockMessage | StockMovementMessage | DebugPricesMessage | ConclusionMessage|
PowerOffersMessage | PowerSelectMessage | PowerConsumeMessage | PowerInventoryMessage | ContentManifestMessage | OrderUpdateMessage | OrderCancelMessage | RenameMessage | PlayersMessage | PowerPresentMessage | LoanBorrowMessage | LoanRepayMessage | StreamerModeMessage;

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
    ResetGameMessage,
    StockMovementMessage,
    IsShockMessage,
    PowerOffersMessage,
    PowerSelectMessage,
    PowerConsumeMessage,
    OrderBookUpdateMessage,
    PowerInventoryMessage,
    ContentManifestMessage,
    PowerPresentMessage,
    Presentation,
    WheelPresentation,
    WheelSegment,
    OrderStatus,
    OrderInfo,
    OrderUpdateMessage,
    OrderCancelMessage,
    RenameMessage,
    PlayerInfo,
    PlayersMessage,
    LoanInfo,
    LoanBorrowMessage,
    LoanRepayMessage,
    StreamerModeMessage,
    DebugPricesMessage,
    ConclusionMessage
}