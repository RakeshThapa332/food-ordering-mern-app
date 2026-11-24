import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useState } from "react";
import CheckoutConfirmPage from "./CheckoutConfirmPage";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cartType";
import { formatNpr } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const Cart = () => {
  const [open, setOpen] = useState<boolean>(false);
  const user = useUserStore((state) => state.user);
  const {
    cart,
    restaurantId,
    restaurantName,
    clearCart,
    decrementQuantity,
    incrementQuantity,
    removeFromTheCart,
  } = useCartStore();

  const totalAmount = cart.reduce((acc, ele) => {
    return acc + ele.price * ele.quantity;
  }, 0);
  return (
    <div className="mx-auto my-8 flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your order</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Shopping cart</h1>
      </div>
      <div className="flex justify-end">
        <Button variant="link" onClick={clearCart} disabled={cart.length === 0}>Clear All</Button>
      </div>
      {restaurantName && cart.length > 0 && (
        <p className="mb-3 text-gray-600">Ordering from <strong>{restaurantName}</strong></p>
      )}
      {cart.length > 0 && !restaurantId && (
        <p className="mb-3 text-red-600">This cart is from an older session. Clear it and add items again to place an order.</p>
      )}
      {cart.length > 0 && <div className="hidden overflow-x-auto rounded-2xl border bg-card md:block">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead>Items</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cart.map((item: CartItem) => (
            <TableRow key={item._id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={item.image} alt="" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell> {item.name}</TableCell>
              <TableCell>{formatNpr(item.price)}</TableCell>
              <TableCell>
                <div className="w-fit flex items-center rounded-full border border-gray-100 dark:border-gray-800 shadow-md">
                  <Button
                  aria-label={`Decrease ${item.name} quantity`}
                  onClick={() => decrementQuantity(item._id)}
                    disabled={item.quantity <= 1}
                    size={"icon"}
                    variant={"outline"}
                    className="rounded-full bg-gray-200"
                  >
                    <Minus />
                  </Button>
                  <Button
                    size={"icon"}
                    className="font-bold border-none"
                    disabled
                    variant={"outline"}
                  >
                    {item.quantity}
                  </Button>
                  <Button
                  aria-label={`Increase ${item.name} quantity`}
                  onClick={() => incrementQuantity(item._id)}
                    size={"icon"}
                    className="rounded-full bg-orange hover:bg-hoverOrange"
                    variant={"outline"}
                  >
                    <Plus />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{formatNpr(item.price * item.quantity)}</TableCell>
              <TableCell className="text-right">
                <Button size={"sm"} onClick={() => removeFromTheCart(item._id)} className="bg-orange hover:bg-hoverOrange">
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="text-2xl font-bold">
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right">{formatNpr(totalAmount)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      </div>}
      <div className="space-y-3 md:hidden">
        {cart.map((item) => (
          <article key={item._id} className="rounded-2xl border bg-card p-4">
            <div className="flex gap-4">
              <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatNpr(item.price)} each</p>
                <p className="mt-2 font-semibold">{formatNpr(item.price * item.quantity)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2">
                <Button aria-label={`Decrease ${item.name} quantity`} onClick={() => decrementQuantity(item._id)} size="icon" variant="outline" className="h-9 w-9 rounded-full">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-6 text-center font-semibold" aria-label="Quantity">{item.quantity}</span>
                <Button aria-label={`Increase ${item.name} quantity`} onClick={() => incrementQuantity(item._id)} size="icon" variant="outline" className="h-9 w-9 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFromTheCart(item._id)} className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </Button>
            </div>
          </article>
        ))}
        {cart.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border bg-card p-4 text-lg font-bold">
            <span>Total</span><span>{formatNpr(totalAmount)}</span>
          </div>
        )}
      </div>
      {cart.length === 0 && (
        <div className="py-10 text-center">
          <p className="mb-4 text-gray-500">Your cart is empty.</p>
          <Link to="/">
            <Button className="bg-orange hover:bg-hoverOrange">Browse restaurants</Button>
          </Link>
        </div>
      )}
      <div className="flex justify-end my-5">
        {user?.isVerified ? (
          <Button
            onClick={() => setOpen(true)}
            disabled={cart.length === 0 || !restaurantId}
            className="bg-orange hover:bg-hoverOrange"
          >
            Proceed To Checkout
          </Button>
        ) : (
          cart.length === 0 || !restaurantId ? (
            <Button disabled className="bg-orange hover:bg-hoverOrange">Sign in to checkout</Button>
          ) : (
            <Button asChild className="bg-orange hover:bg-hoverOrange"><Link to="/login">Sign in to checkout</Link></Button>
          )
        )}
      </div>
      {user?.isVerified && <CheckoutConfirmPage open={open} setOpen={setOpen} />}
    </div>
  );
};

export default Cart;
