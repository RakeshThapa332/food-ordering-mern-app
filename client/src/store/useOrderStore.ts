import { CheckoutSessionRequest, OrderState } from "@/types/orderType";
import api, { getApiErrorMessage } from "@/lib/api";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import { useCartStore } from "./useCartStore";

export const useOrderStore = create<OrderState>()(persist((set => ({
    loading: false,
    orders: [],
    createCheckoutSession: async (checkoutSession: CheckoutSessionRequest) => {
        try {
            set({ loading: true });
            const response = await api.post("/order/checkout/create-checkout-session", checkoutSession, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const checkoutUrl = response.data.session?.url;
            if (!checkoutUrl) {
                throw new Error("The payment provider did not return a checkout URL.");
            }
            useCartStore.getState().clearCart();
            window.location.assign(checkoutUrl);
            set({ loading: false });
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not start checkout."));
            set({ loading: false });
        }
    },
    getOrderDetails: async () => {
        try {
            set({loading:true});
            const response = await api.get("/order/");
            set({loading:false, orders:response.data.orders});
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not load your orders."));
            set({loading:false});
        }
    }
})), {
    name: 'order-name',
    storage: createJSONStorage(() => localStorage)
}))