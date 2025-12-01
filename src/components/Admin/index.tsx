import { useCallback, useMemo } from "react";
import { useGameStore, type GameSettings } from "../../context/game.context";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";
import { usePriceStore } from "../../context/stock.store";
import { useShallow } from "zustand/shallow";



export const AdminModal = () => {
    const {prices} = usePriceStore(useShallow((state) => ({prices: state.prices})));
    const {paused,isAdmin, onlineUsers} = useGameStore(useShallow((state) => ({paused: state.paused, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers})));
    const {sendMessage} = useWebsocketContext();
    const {gameSettings, saveGameSettings} = useGameStore(useShallow((state) => ({saveGameSettings: state.saveGameSettings, gameSettings: state.gameSettings})));
    const setGameSettings = useCallback((settings: Partial<GameSettings>) => {
        sendMessage({type: MessageType.ADMIN_SETTINGS, settings});
        saveGameSettings(settings);
    }, [sendMessage, saveGameSettings]);

    

    const onStartGame = () => {
        sendMessage({type: MessageType.TOGGLE_PAUSE});
        setTimeout(()=>{
            useGameStore.getState().setPaused(!paused);
        })
    }
    // console.log('AdminModal render', {isAdmin, pricesLength: prices.length, paused});
    const visibleSettings = useMemo(() => isAdmin && prices.length >= 1 && paused, [isAdmin, prices.length, paused]);

    if(visibleSettings){
        return (
            <>
            <div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl z-50">
                <div className="card-body items-center ">
                    <h1 className="text-4xl font-bold text-center bg-clip-text text-primary">
                        Admin Settings
                    </h1>
                    <p className="text-center text-base-content/70 mb-2">
                        Modify game settings below
                    </p>
                    <div className="form-control w-full mb-2">
                        <label className="label">
                            <span className="label-text font-semibold">Stock Ticker</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter stock ticker"
                            className="input input-bordered input-primary w-full"
                            aria-placeholder="AAPL"
                            maxLength={4}
                            value={gameSettings.ticketName || ''}
                            onChange={(e) => setGameSettings({ticketName: e.target.value})}
                        />
                    </div>

                    <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Starting Cash</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter starting cash amount"
                                className="input input-bordered input-primary w-full"
                                value={gameSettings.startingCash || ''}
                                onChange={(e) => setGameSettings({startingCash: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Opening Price</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter opening price"
                                className="input input-bordered input-primary w-full"
                                value={gameSettings.openingPrice || ''}
                                onChange={(e) => setGameSettings({openingPrice: parseInt(e.target.value)})}
                            />
                        </div>

                    </div>

                    <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Market Volatility</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter market volatility (%)"
                                className="input input-bordered input-primary w-full"
                                value={(gameSettings.marketVolatility*100) || ''}
                                min={0}
                                onChange={(e) => setGameSettings({marketVolatility: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Game Duration (mins)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter game duration in minutes"
                                className="input input-bordered input-primary w-full"
                                value={gameSettings.gameDuration || ''}
                                onChange={(e) => setGameSettings({gameDuration: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="form-control w-full mb-2">
                        <label className="label">
                            <span className="label-text font-semibold">Bot Count</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Enter bot count"
                            className="input input-bordered input-primary w-full"
                            value={gameSettings.bots || ''}
                            min={0}
                            max={50}
                            onChange={(e) => setGameSettings({bots: parseInt(e.target.value)})}
                        />
                    </div>

                    <p className="text-center text-base-content/70 mb-6">
                        There are currently {onlineUsers} clients connected.
                    </p>

                    <div className="card-actions">
                        <button className="btn btn-primary" onClick={onStartGame}>Save & Start</button>
                    </div>

            </div>
            </div>
            </>
        );
    }else if (paused){
        return (<div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl z-50">
        <div className="card-body items-center bg-white">
            <h1 className="text-4xl font-bold text-center bg-clip-text text-primary">
                Game Paused
            </h1>

            {isAdmin ? <div className="card-actions">
                <button className="btn btn-primary" onClick={onStartGame}>Resume</button>
            </div> :  <p className="text-center text-base-content/70 mb-6">
                Wait for your admin to resume the game.
                </p>}
        </div>
    </div>
        )
    }


  return null;


}