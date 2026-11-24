import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Loader2, Menu, Moon, ShoppingBag, ShoppingCart, Sun, UserRound } from "lucide-react";

const ThemeMenu = () => {
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Choose appearance">
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar = () => {
  const { user, loading, logout } = useUserStore();
  const cartCount = useCartStore((state) => state.cart.reduce((count, item) => count + item.quantity, 0));
  const verified = Boolean(user?.isVerified);

  return (
    <div className="border-b bg-background/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-xl" aria-label="FoodWorld home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span>FoodWorld</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">Home</Link>
          {verified && (
            <>
              <Link to="/order/status" className="text-sm font-medium text-muted-foreground hover:text-foreground">Orders</Link>
              {user?.admin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto px-2 text-sm font-medium">Dashboard</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link to="/admin">Overview</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/restaurant">Restaurant</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/menu">Menu management</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/orders">Orders</Link></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeMenu />
          <Link to="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border hover:bg-accent" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</span>}
          </Link>
          {verified ? (
            <>
              <Link to="/profile" aria-label="Your profile">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profilePicture} alt="" />
                  <AvatarFallback><UserRound className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" onClick={logout} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button asChild className="bg-orange hover:bg-hoverOrange"><Link to="/signup">Create account</Link></Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</span>}
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle><Link to="/">FoodWorld</Link></SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                <SheetClose asChild><Link to="/" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Home</Link></SheetClose>
                {verified ? (
                  <>
                    <SheetClose asChild><Link to="/profile" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Profile</Link></SheetClose>
                    <SheetClose asChild><Link to="/order/status" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Orders</Link></SheetClose>
                    {user?.admin && (
                      <>
                        <SheetClose asChild><Link to="/admin" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Dashboard overview</Link></SheetClose>
                        <SheetClose asChild><Link to="/admin/restaurant" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Restaurant dashboard</Link></SheetClose>
                        <SheetClose asChild><Link to="/admin/menu" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Menu management</Link></SheetClose>
                        <SheetClose asChild><Link to="/admin/orders" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Restaurant orders</Link></SheetClose>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <SheetClose asChild><Link to="/login" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Log in</Link></SheetClose>
                    <SheetClose asChild><Link to="/signup" className="rounded-lg px-3 py-3 font-medium hover:bg-accent">Create account</Link></SheetClose>
                  </>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between border-t pt-5">
                <ThemeMenu />
                {verified && (
                  <Button variant="outline" onClick={logout} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
