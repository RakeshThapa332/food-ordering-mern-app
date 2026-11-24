import { Orders } from "./orderType";

export type MenuItem = {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}
export type Restaurant = {
    _id: string;
    user: string;
    restaurantName: string;
    city: string;
    country: string;
    deliveryTime: number;
    cuisines: string[];
    menus: MenuItem[];
    imageUrl: string;
}

export type SearchedRestaurant = {
    data:Restaurant[]
}

export type RestaurantState = {
    loading: boolean;
    restaurantError: string | null;
    searchError: string | null;
    restaurant: Restaurant | null;
    allRestaurants: Restaurant[];
    searchedRestaurant: SearchedRestaurant | null;
    appliedFilter:string[];
    singleRestaurant: Restaurant | null,
    restaurantOrder:Orders[],
    restaurantOrdersLoading: boolean,
    createRestaurant: (formData: FormData) => Promise<void>;
    getRestaurant: () => Promise<void>;
    getAllRestaurants: () => Promise<void>;
    updateRestaurant: (formData: FormData) => Promise<void>;
    searchRestaurant: (searchText: string, searchQuery: string, selectedCuisines: string[]) => Promise<void>;
    addMenuToRestaurant: (menu: MenuItem) => void;
    updateMenuToRestaurant: (menu: MenuItem) => void;
    removeMenuFromRestaurant: (menuId: string) => void;
    setAppliedFilter: (value:string) => void;
    resetAppliedFilter: () => void;
    getSingleRestaurant: (restaurantId:string) => Promise<void>;
    getRestaurantOrders: () => Promise<void>;
    updateRestaurantOrder: (orderId:string, status:string) => Promise<void>;
}