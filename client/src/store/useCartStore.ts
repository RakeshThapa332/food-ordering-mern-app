import { CartState } from "@/types/cartType";
import { MenuItem } from "@/types/restaurantType";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";


export const useCartStore = create<CartState>()(persist((set, get) => ({
    cart: [],
    restaurantId: null,
    restaurantName: null,
    addToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => {
        const current = get();
        if (current.cart.length > 0 && !current.restaurantId) {
            toast.error("Clear your previous cart before adding items.");
            return;
        }
        if (current.restaurantId && current.restaurantId !== restaurantId) {
            toast.error(`Your cart already contains items from ${current.restaurantName}. Clear it before ordering from another restaurant.`);
            return;
        }

        set((state) => {
            const exisitingItem = state.cart.find((cartItem) => cartItem._id === item._id);
            if (exisitingItem) {
                // already added in cart then inc qty
                return {
                    cart: state?.cart.map((cartItem) => cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                    )
                };
            } else {
                // add cart
                return {
                    cart: [...state.cart, { ...item, quantity: 1 }],
                    restaurantId,
                    restaurantName,
                }
            }
        })
    },
    clearCart: () => {
        set({ cart: [], restaurantId: null, restaurantName: null });
    },
    removeFromTheCart: (id: string) => {
        set((state) => {
            const cart = state.cart.filter((item) => item._id !== id);
            return cart.length > 0
                ? { cart }
                : { cart, restaurantId: null, restaurantName: null };
        })
    },
    incrementQuantity: (id: string) => {
        set((state) => ({
            cart: state.cart.map((item) => item._id === id ? { ...item, quantity: item.quantity + 1 } : item)
        }))
    },
    decrementQuantity: (id: string) => {
        set((state) => ({
            cart: state.cart.map((item) => item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item)
        }))
    }
}),
    {
        name: 'cart-name',
        storage: createJSONStorage(() => localStorage)
    }
))