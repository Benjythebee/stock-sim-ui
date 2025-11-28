import { create } from "zustand";
import { usePriceStore } from "./stock.store";

type DebugPriceStore = {
    intrinsicValues: number[],
    intrinsicValue: number,
    setIntrinsicValue: (intrinsicValue: number) => void,
    guidePrice: number,
    setGuidePrice: (guidePrice: number) => void,
    guidePrices: number[],

}

export const useDebugStore = create<DebugPriceStore>((set) => ({
    intrinsicValue: 0,
    guidePrice: 0,
    intrinsicValues: [],
    guidePrices: [],
    setIntrinsicValue: (intrinsicValue) => set({
        intrinsicValue,
    }),
    setGuidePrice: (guidePrice) => set({
        guidePrice,
    }),
}))

usePriceStore.subscribe((s)=>{
    if(s.timeLabels.length > useDebugStore.getState().intrinsicValues.length){

        useDebugStore.setState((state) => ({
            intrinsicValues: [...state.intrinsicValues, state.intrinsicValue],
            guidePrices: [...state.guidePrices, state.guidePrice],
        }))
    }
})