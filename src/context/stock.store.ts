import { create } from "zustand";
import { DateTime } from 'luxon';
import { useGameStore } from "./game.context";

export type PriceStore = {
    prices: {
        x: number|DateTime,
        o: number,  // open
        h: number,  // high
        l: number,  // low
        c: number   // close                    
    }[],
    timeLabels: DateTime[],
    price: number,
    setPrice: (price: number) => void,
    asks: [number, number][],
    setAsks: (asks: [number, number][]) => void,
    bids: [number, number][],
    setBids: (bids: [number, number][]) => void,
    clock: number,
    timeLeft: number,
    setClock: (clock: number) => void,
}

export const usePriceStore = create<PriceStore>((set,get) => ({
    price: 0,
    timeLabels: [],
    setPrice: (price) => {
        const prices = get().prices;
        const labels = get().timeLabels
        const labelLength = labels.length;

        if(labelLength > 0){
            const currentCandle = prices[labelLength -1];

            if(!currentCandle) {
                prices[labelLength -1] = {
                    x: labels[labelLength -1].valueOf(),
                    o: price,
                    h: price,
                    l: price,
                    c: price
                }
            }else{
                // Update existing candlestick
                currentCandle.h = Math.max(currentCandle.h, price);
                currentCandle.l = Math.min(currentCandle.l, price);
                currentCandle.c = price;

            }
        }else{
            // No timestamp yet, create first entry
            prices.push({
                x: labels[labels.length - 1].valueOf(),
                o: price,
                h: price,
                l: price,
                c: price
            });
        }

        // console.log('Updated prices:', prices,labels);
       return set({ price, prices: [...prices], timeLabels: [...labels] });
    },
    prices: [],
    asks: [],
    setAsks: (asks: [number, number][]) => set({ asks }),
    bids: [],
    setBids: (bids: [number, number][]) => set({ bids }),
    clock: 0,
    setClock: (clock) =>{
        const luxonTime = DateTime.fromMillis(clock);
        const timeLabels = get().timeLabels;

        // // Handle the case we didnt get a price update when candle ends
        const prices = get().prices;
        const lastPrice = get().price;
        const labelLength = timeLabels.length;
        const started = useGameStore.getState().started;
        // handle length mismatch

        // console.log('prices.length:', prices.length, 'labelLength:', labelLength, 'started:', started);
        if(!started){
            const index = 0
            // First candle
            prices[index] = {
                x: luxonTime.valueOf(),
                o: lastPrice,
                h: lastPrice,
                l: lastPrice,
                c: lastPrice
            }
            // console.log('Created first candle:', prices);
            set({ prices: [...prices],clock: clock, timeLabels: [luxonTime] });
            return
        }

        if(prices.length < labelLength+1){
            // First candle
            console.log('Created missing candle:', prices);
            set({ prices: [...prices,{
                x: luxonTime.valueOf(),
                o: lastPrice,
                h: lastPrice,
                l: lastPrice,
                c: lastPrice
            }] });
        }


     
        // if(labelLength > 0){
            // const currentCandle = prices[labelLength -1];
            // const lastPrice = get().price;
            // if(!currentCandle){
            //     prices[labelLength -1] = {
            //         x: timeLabels[labelLength -1].valueOf(),
            //         o: lastPrice,
            //         h: lastPrice,
            //         l: lastPrice,
            //         c: lastPrice
            //     }
            //     set({ prices: [...prices] });
            // }
        // }else{
        //     // No timestamp yet, create first entry
        //     const lastPrice = get().price;
        //     prices.push({
        //         x: timeLabels[timeLabels.length - 1].valueOf(),
        //         o: lastPrice,
        //         h: lastPrice,
        //         l: lastPrice,
        //         c: lastPrice
        //     });
        //     set({ prices: [...prices] });
        // }

        set({ clock: clock, timeLabels: [...timeLabels, luxonTime] });
    },
    timeLeft: 0,
}));

