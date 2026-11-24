import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, Clock3, UtensilsCrossed, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/utils";
import { useRestaurantStore } from "@/store/useRestaurantStore";

const Dashboard = () => {
  const {
    restaurant,
    restaurantOrder,
    restaurantOrdersLoading,
    loading,
    getRestaurant,
    getRestaurantOrders,
  } = useRestaurantStore();

  useEffect(() => {
    void getRestaurant();
    void getRestaurantOrders();
  }, [getRestaurant, getRestaurantOrders]);

  const pendingOrders = restaurantOrder.filter((order) => order.status === "pending").length;
  const revenue = restaurantOrder
    .filter((order) => order.status !== "pending")
    .reduce((total, order) => total + (order.totalAmount || 0), 0) / 100;

  const stats = [
    { label: "Menu items", value: restaurant?.menus.length ?? 0, icon: UtensilsCrossed },
    { label: "Total orders", value: restaurantOrder.length, icon: ClipboardList },
    { label: "Awaiting confirmation", value: pendingOrders, icon: Clock3 },
    { label: "Confirmed sales", value: formatNpr(revenue), icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Restaurant workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">A quick view of your restaurant's activity.</p>
        </div>
        <Button asChild className="bg-orange hover:bg-hoverOrange">
          <Link to="/admin/orders">Manage orders <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      {loading && !restaurant ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : !restaurant ? (
        <section className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">Set up your restaurant</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Add your restaurant profile and menu to start receiving orders.</p>
          <Button asChild className="mt-5 bg-orange hover:bg-hoverOrange"><Link to="/admin/restaurant">Add restaurant</Link></Button>
        </section>
      ) : (
        <>
          <section aria-label="Restaurant statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-primary dark:bg-orange-950"><Icon className="h-4 w-4" /></span>
                </div>
                <p className="mt-4 text-2xl font-bold">{value}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
            <div className="rounded-2xl border bg-card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Recent orders</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Latest orders for your restaurant</p>
                </div>
                <Button asChild variant="outline" size="sm"><Link to="/admin/orders">View all</Link></Button>
              </div>
              {restaurantOrdersLoading ? (
                <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
              ) : restaurantOrder.length === 0 ? (
                <p className="rounded-xl bg-muted/50 p-5 text-sm text-muted-foreground">New orders will show up here.</p>
              ) : (
                <div className="divide-y">
                  {restaurantOrder.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold">{order.deliveryDetails.name}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">{order.status.replace("outfordelivery", "out for delivery")}</p>
                      </div>
                      <p className="text-sm font-semibold">{order.totalAmount ? formatNpr(order.totalAmount / 100) : "Payment pending"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-bold">Quick actions</h2>
              <div className="mt-4 grid gap-3">
                <Button asChild variant="outline" className="h-auto justify-between py-3">
                  <Link to="/admin/restaurant">Restaurant information <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-auto justify-between py-3">
                  <Link to="/admin/menu">Manage menu <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-auto justify-between py-3">
                  <Link to="/admin/orders">Update order statuses <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
