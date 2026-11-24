import { MenuItem } from "@/types/restaurantType";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useCartStore } from "@/store/useCartStore";
import { useNavigate } from "react-router-dom";
import { formatNpr } from "@/lib/utils";

const AvailableMenu = ({
  menus,
  restaurantId,
  restaurantName,
}: {
  menus: MenuItem[];
  restaurantId: string;
  restaurantName: string;
}) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  return (
    <div className="py-4">
      <h2 className="mb-6 text-xl font-bold tracking-tight md:text-2xl">
        Menu
      </h2>
      {menus.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">No menu items match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu: MenuItem) => (
            <Card key={menu._id} className="overflow-hidden rounded-2xl bg-card shadow-sm">
              <img src={menu.image} alt={menu.name} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <CardContent className="p-5">
                <h3 className="text-lg font-bold">
                  {menu.name}
                </h3>
                <p className="mt-2 min-h-10 text-sm leading-6 text-muted-foreground">{menu.description}</p>
                <p className="mt-4 text-lg font-bold text-primary">
                  {formatNpr(menu.price)}
                </p>
              </CardContent>
              <CardFooter className="px-5 pb-5">
                <Button
                  onClick={() => {
                    addToCart(menu, restaurantId, restaurantName);
                    navigate("/cart");
                  }}
                  className="w-full rounded-xl bg-orange hover:bg-hoverOrange"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableMenu;
