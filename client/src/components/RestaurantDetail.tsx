import { useRestaurantStore } from "@/store/useRestaurantStore";
import AvailableMenu from "./AvailableMenu";
import { Badge } from "./ui/badge";
import { Search, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "./ui/input";

const RestaurantDetail = () => {
  const params = useParams();
  const { singleRestaurant, loading, getSingleRestaurant } = useRestaurantStore();
  const [menuSearch, setMenuSearch] = useState("");

  useEffect(() => {
    if (params.id) {
      getSingleRestaurant(params.id);
    }
  }, [getSingleRestaurant, params.id]);

  if (loading && !singleRestaurant) {
    return <p className="max-w-6xl mx-auto my-10 text-gray-500">Loading restaurant menu...</p>;
  }
  if (!singleRestaurant) {
    return <p className="max-w-6xl mx-auto my-10 text-gray-500">Restaurant not found.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto my-10">
      <div className="w-full">
        <div className="relative w-full h-32 md:h-64 lg:h-72">
          <img
            src={singleRestaurant?.imageUrl || "Loading..."}
            alt="res_image"
            className="object-cover w-full h-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between">
          <div className="my-5">
            <h1 className="font-medium text-xl">{singleRestaurant?.restaurantName || "Loading..."}</h1>
            <div className="flex gap-2 my-2">
              {singleRestaurant?.cuisines.map((cuisine: string, idx: number) => (
                <Badge key={idx}>{cuisine}</Badge>
              ))}
            </div>
            <div className="flex md:flex-row flex-col gap-2 my-5">
              {singleRestaurant.deliveryTime > 0 && (
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <p className="font-medium">Delivery time: <span className="text-primary">{singleRestaurant.deliveryTime} min</span></p>
              </div>
              )}
            </div>
          </div>
        </div>
        <div className="mb-6 max-w-lg">
          <label htmlFor="menu-search" className="mb-2 block text-sm font-medium">Search this menu</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="menu-search" type="search" value={menuSearch} onChange={(event) => setMenuSearch(event.target.value)} placeholder="Dish name or description" className="pl-10" />
          </div>
        </div>
        <AvailableMenu
          menus={(singleRestaurant.menus || []).filter((menu) => `${menu.name} ${menu.description}`.toLowerCase().includes(menuSearch.trim().toLowerCase()))}
          restaurantId={singleRestaurant._id}
          restaurantName={singleRestaurant.restaurantName}
        />
      </div>
    </div>
  );
};

export default RestaurantDetail;
