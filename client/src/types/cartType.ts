import { MenuItem } from "./restaurantType";

export interface CartItem extends MenuItem { 
    quantity:number;
}
export type CartState = {
    cart:CartItem[];
    restaurantId:string | null;
    restaurantName:string | null;
    addToCart:(item:MenuItem, restaurantId:string, restaurantName:string) => void;
    clearCart: () => void;
    removeFromTheCart: (id:string) => void;
    incrementQuantity: (id:string) => void;
    decrementQuantity: (id:string) => void;
}