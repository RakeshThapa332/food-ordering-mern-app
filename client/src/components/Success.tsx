 
import { Separator } from "./ui/separator";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useOrderStore } from "@/store/useOrderStore";
import { useEffect } from "react";
import { formatNpr } from "@/lib/utils";

const Success = () => {
  const { orders, loading, getOrderDetails } = useOrderStore();

  useEffect(() => {
    getOrderDetails();
  }, [getOrderDetails]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-300">Loading your order...</h1>
      </div>
    );

  const latestOrder = orders[0];
  if (!latestOrder)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-300">No orders found.</h1>
        <Link to="/"><Button className="bg-orange hover:bg-hoverOrange">Browse restaurants</Button></Link>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Order Status:{" "}
            <span className="text-[#FF5A5A]">{latestOrder.status.toUpperCase()}</span>
          </h1>
          {latestOrder.restaurant?.restaurantName && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">{latestOrder.restaurant.restaurantName}</p>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Order Summary
          </h2>
          {latestOrder.cartItems.map((item) => (
            <div key={item.menuId} className="mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-md object-cover"
                  />
                  <h3 className="ml-4 text-gray-800 dark:text-gray-200 font-medium">
                    {item.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium">{formatNpr(item.price)} × {item.quantity}</span>
                </div>
              </div>
              <Separator className="my-4" />
            </div>
          ))}
        </div>
        <Link to="/">
          <Button className="bg-orange hover:bg-hoverOrange w-full py-3 rounded-md shadow-lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Success;
