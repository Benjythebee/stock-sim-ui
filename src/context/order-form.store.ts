import { create } from "zustand";
import type { OrderKind } from "../hooks/useGameActions";

/** The order form's draft, in a store so clicking the chart can fill in the limit price. */
type OrderFormStore = {
    orderType: OrderKind,
    /** The price input's text (can be empty or mid-edit). */
    limitPrice: string,
    setOrderType: (orderType: OrderKind) => void,
    setLimitPrice: (limitPrice: string) => void,
    /** A price picked on the chart: switches the form to a limit order at that price. */
    pickLimitPrice: (price: number) => void,
}

const initialOrderFormState = () => ({
    orderType: 'LIMIT' as OrderKind,
    limitPrice: '',
});

export const useOrderFormStore = create<OrderFormStore>((set) => ({
    ...initialOrderFormState(),
    setOrderType: (orderType) => set({ orderType }),
    setLimitPrice: (limitPrice) => set({ limitPrice }),
    pickLimitPrice: (price) => set({ orderType: 'LIMIT', limitPrice: price.toFixed(2) }),
}));

export const resetOrderFormStore = () => useOrderFormStore.setState(initialOrderFormState());
