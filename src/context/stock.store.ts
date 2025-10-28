import { create } from "zustand";
import { DateTime } from 'luxon';

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
            if(!labelLength) return;
            // No timestamp yet, create first entry
            prices.push({
                x: labels[labels.length - 1].valueOf(),
                o: price,
                h: price,
                l: price,
                c: price
            });
        }


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
        set({ clock: clock, timeLabels: [...timeLabels, luxonTime] });
    },
}));

