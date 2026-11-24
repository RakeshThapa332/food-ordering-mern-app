import api, { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useRestaurantStore } from "./useRestaurantStore";
import { MenuItem } from "@/types/restaurantType";

type MenuState = {
    loading: boolean,
    menu: MenuItem | null,
    createMenu: (formData: FormData) => Promise<void>;
    editMenu: (menuId: string, formData: FormData) => Promise<void>;
    deleteMenu: (menuId: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>()(persist((set) => ({
    loading: false,
    menu: null,
    createMenu: async (formData: FormData) => {
        try {
            set({ loading: true });
            const response = await api.post("/menu/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false, menu: response.data.menu });
            }
            // update restaurant 
            useRestaurantStore.getState().addMenuToRestaurant(response.data.menu);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not add this menu item."));
            set({ loading: false });
        }
    },
    editMenu: async (menuId:string,formData: FormData) => {
        try {
            set({ loading: true });
            const response = await api.put(`/menu/${menuId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if(response.data.success){
             toast.success(response.data.message);
             set({loading:false, menu:response.data.menu});
            }
            // update restaurant menu
            useRestaurantStore.getState().updateMenuToRestaurant(response.data.menu);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not update this menu item."));
            set({ loading: false });
        }
    },
    deleteMenu: async (menuId: string) => {
        try {
            set({ loading: true });
            const response = await api.delete(`/menu/${menuId}`);
            if (response.data.success) {
                useRestaurantStore.getState().removeMenuFromRestaurant(menuId);
                toast.success(response.data.message);
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not delete this menu item."));
        } finally {
            set({ loading: false });
        }
    },
}), {
    name: "menu-name",
    storage: createJSONStorage(() => localStorage)
}))