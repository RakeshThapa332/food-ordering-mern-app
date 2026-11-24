import { Orders } from "@/types/orderType";
import { MenuItem, RestaurantState } from "@/types/restaurantType";
import api, { getApiErrorMessage, getApiErrorStatus } from "@/lib/api";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useRestaurantStore = create<RestaurantState>()(persist((set, get) => ({
    loading: false,
    restaurantError: null,
    searchError: null,
    restaurant: null,
    allRestaurants: [],
    searchedRestaurant: null,
    appliedFilter: [],
    singleRestaurant: null,
    restaurantOrder: [],
    restaurantOrdersLoading: false,
    createRestaurant: async (formData: FormData) => {
        try {
            set({ loading: true });
            const response = await api.post("/restaurant/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false });
                await get().getRestaurant();
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not create the restaurant."));
            set({ loading: false });
        }
    },
    getRestaurant: async () => {
        try {
            set({ loading: true });
            const response = await api.get("/restaurant/");
            if (response.data.success) {
                set({ loading: false, restaurant: response.data.restaurant });
            }
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 404) {
                set({ restaurant: null });
            } else {
                toast.error(getApiErrorMessage(error, "Could not load your restaurant."));
            }
            set({ loading: false });
        }
    },
    getAllRestaurants: async () => {
        try {
            set({ loading: true, restaurantError: null });
            const response = await api.get("/restaurant/all");
            if (response.data.success) {
                set({ allRestaurants: response.data.data, restaurantError: null });
            } else {
                throw new Error("Could not load restaurants.");
            }
        } catch (error: unknown) {
            const message = getApiErrorMessage(error, "Could not load restaurants.");
            toast.error(message);
            set({ restaurantError: message });
        } finally {
            set({ loading: false });
        }
    },
    updateRestaurant: async (formData: FormData) => {
        try {
            set({ loading: true });
            const response = await api.put("/restaurant/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false, restaurant: response.data.restaurant });
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not update the restaurant."));
            set({ loading: false });
        }
    },
    searchRestaurant: async (searchText: string, searchQuery: string, selectedCuisines: string[]) => {
        try {
            set({ loading: true, searchError: null });

            const params = new URLSearchParams();
            params.set("searchQuery", searchQuery);
            params.set("selectedCuisines", selectedCuisines.join(","));

            const searchPath = searchText
                ? `/restaurant/search/${encodeURIComponent(searchText)}`
                : "/restaurant/search";
            const response = await api.get(`${searchPath}?${params.toString()}`);
            if (response.data.success) {
                set({ loading: false, searchedRestaurant: response.data, searchError: null });
            } else {
                throw new Error("Could not search restaurants.");
            }
        } catch (error: unknown) {
            const message = getApiErrorMessage(error, "Could not search restaurants.");
            toast.error(message);
            set({ loading: false, searchedRestaurant: null, searchError: message });
        }
    },
    addMenuToRestaurant: (menu: MenuItem) => {
        set((state) => ({
            restaurant: state.restaurant ? { ...state.restaurant, menus: [...state.restaurant.menus, menu] } : null,
        }))
    },
    updateMenuToRestaurant: (updatedMenu: MenuItem) => {
        set((state) => {
            if (!state.restaurant) return state;
            return {
                restaurant: {
                    ...state.restaurant,
                    menus: state.restaurant.menus.map((menu) => menu._id === updatedMenu._id ? updatedMenu : menu)
                }
            };
        })
    },
    removeMenuFromRestaurant: (menuId: string) => {
        set((state) => state.restaurant
            ? { restaurant: { ...state.restaurant, menus: state.restaurant.menus.filter((menu) => menu._id !== menuId) } }
            : state);
    },
    setAppliedFilter: (value: string) => {
        set((state) => {
            const isAlreadyApplied = state.appliedFilter.includes(value);
            const updatedFilter = isAlreadyApplied ? state.appliedFilter.filter((item) => item !== value) : [...state.appliedFilter, value];
            return { appliedFilter: updatedFilter }
        })
    },
    resetAppliedFilter: () => {
        set({ appliedFilter: [] })
    },
    getSingleRestaurant: async (restaurantId: string) => {
        try {
            set({ loading: true, singleRestaurant: null });
            const response = await api.get(`/restaurant/${restaurantId}`);
            if (response.data.success) {
                set({ singleRestaurant: response.data.restaurant })
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not load this restaurant."));
        } finally {
            set({ loading: false });
        }
    },
    getRestaurantOrders: async () => {
        try {
            set({ restaurantOrdersLoading: true });
            const response = await api.get("/restaurant/order");
            if (response.data.success) {
                set({ restaurantOrder: response.data.orders });
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not load restaurant orders."));
        } finally {
            set({ restaurantOrdersLoading: false });
        }
    },
    updateRestaurantOrder: async (orderId: string, status: string) => {
        try {
            const response = await api.put(`/restaurant/order/${orderId}/status`, { status }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                const updatedOrder = get().restaurantOrder.map((order: Orders) => {
                    return order._id === orderId ? { ...order, status: response.data.status } : order;
                })
                set({ restaurantOrder: updatedOrder });
                toast.success(response.data.message);
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not update order status."));
        }
    }

}), {
    name: 'restaurant-name',
    storage: createJSONStorage(() => localStorage)
}))