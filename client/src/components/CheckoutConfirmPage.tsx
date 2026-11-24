import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUserStore } from "@/store/useUserStore";
import { CheckoutSessionRequest } from "@/types/orderType";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CheckoutConfirmPage = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user } = useUserStore();
  const [input, setInput] = useState({
    name: user?.fullname || "",
    email: user?.email || "",
    contact: user?.contact.toString() || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
  });
  const { cart, restaurantId, restaurantName } = useCartStore();
  const { createCheckoutSession, loading } = useOrderStore();
  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };
  const checkoutHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!restaurantId || cart.length === 0) {
      toast.error("Add menu items from a restaurant before checking out.");
      return;
    }

    const checkoutData: CheckoutSessionRequest = {
      cartItems: cart.map((cartItem) => ({
        menuId: cartItem._id,
        name: cartItem.name,
        image: cartItem.image,
        price: cartItem.price,
        quantity: cartItem.quantity,
      })),
      deliveryDetails: input,
      restaurantId,
    };
    await createCheckoutSession(checkoutData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle className="font-semibold">Delivery details</DialogTitle>
        {restaurantName && <p className="text-sm text-gray-500">Restaurant: {restaurantName}</p>}
        <DialogDescription className="text-xs">
          Confirm where to deliver your order. You'll complete payment securely with Stripe.
        </DialogDescription>
        <form
          onSubmit={checkoutHandler}
          className="md:grid grid-cols-2 gap-2 space-y-1 md:space-y-0"
        >
          <div>
            <Label htmlFor="checkout-name">Full name</Label>
            <Input
              id="checkout-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              value={input.name}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              disabled
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label htmlFor="checkout-contact">Contact number</Label>
            <Input
              id="checkout-contact"
              type="tel"
              name="contact"
              autoComplete="tel"
              required
              value={input.contact}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label htmlFor="checkout-address">Street address</Label>
            <Input
              id="checkout-address"
              type="text"
              name="address"
              autoComplete="street-address"
              required
              value={input.address}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label htmlFor="checkout-city">City</Label>
            <Input
              id="checkout-city"
              type="text"
              name="city"
              autoComplete="address-level2"
              required
              value={input.city}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label htmlFor="checkout-country">Country</Label>
            <Input
              id="checkout-country"
              type="text"
              name="country"
              autoComplete="country-name"
              required
              value={input.country}
              onChange={changeEventHandler}
            />
          </div>
          <DialogFooter className="col-span-2 pt-5">
            {loading ? (
              <Button disabled className="bg-orange hover:bg-hoverOrange">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button className="bg-orange hover:bg-hoverOrange">
                Continue To Payment
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutConfirmPage;
