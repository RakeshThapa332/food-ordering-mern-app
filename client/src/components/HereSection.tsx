import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { ArrowRight, Search, Utensils } from "lucide-react";
import { Button } from "./ui/button";
import HereImage from "@/assets/hero_pizza.webp";
import { useNavigate } from "react-router-dom";
import { formatNpr } from "@/lib/utils";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { Link } from "react-router-dom";

const HereSection = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const { allRestaurants, loading, getAllRestaurants, restaurantError } = useRestaurantStore();

  useEffect(() => {
    getAllRestaurants();
  }, [getAllRestaurants]);

  const popularFoods = allRestaurants
    .flatMap((restaurant) =>
      restaurant.menus.map((menu, menuIndex) => ({
        ...menu,
        menuIndex,
        restaurantName: restaurant.restaurantName,
        restaurantId: restaurant._id,
      }))
    )
    .sort((first, second) => first.menuIndex - second.menuIndex)
    .slice(0, 6);
  const cuisines = [...new Set(allRestaurants.flatMap((restaurant) => restaurant.cuisines))].slice(0, 8);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchText.trim();
    if (query) navigate(`/search/${encodeURIComponent(query)}`);
    else navigate("/search/all");
  };

  return (
    <div>
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-10 md:py-16 lg:px-8">
        <div className="order-2 flex flex-col items-start md:order-1">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-orange-800 dark:bg-orange-950 dark:text-orange-200">
            <Utensils className="h-4 w-4" /> Good food, delivered
          </span>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your next favorite meal is <span className="text-primary">closer than ever.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            Discover local restaurants, explore their menus, and bring something delicious to your table.
          </p>
          <form onSubmit={search} className="mt-8 flex w-full max-w-xl gap-2 rounded-2xl border bg-card p-2 shadow-lg shadow-black/5">
            <div className="relative min-w-0 flex-1">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchText}
                placeholder="Restaurant, dish, or cuisine"
                aria-label="Search restaurants and dishes"
                onChange={(e) => setSearchText(e.target.value)}
                className="h-12 border-0 pl-11 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" className="h-12 rounded-xl bg-orange px-5 hover:bg-hoverOrange">Search</Button>
          </form>
          {cuisines.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-muted-foreground">Try:</span>
              {cuisines.slice(0, 4).map((cuisine) => (
                <Link
                  key={cuisine}
                  to={`/search/${encodeURIComponent(cuisine)}`}
                  className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                >
                  {cuisine}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="relative order-1 mx-auto w-full max-w-xl md:order-2">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-orange-100/70 blur-xl dark:bg-orange-950/30" />
          <img
            src={HereImage}
            alt="Freshly baked pizza with colorful toppings"
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-xl"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Explore the menu</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Menu highlights</h2>
            <p className="mt-2 text-sm text-muted-foreground">A taste of what local restaurants are serving.</p>
          </div>
        </div>
        {loading && allRestaurants.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : popularFoods.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Menu items will appear here as restaurants join.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularFoods.map((food) => (
            <article key={`${food.restaurantId}-${food._id}`} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <img src={food.image} alt={food.name} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
              <div className="p-5">
                <p className="text-sm font-medium text-primary">{food.restaurantName}</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold">{food.name}</h3>
                  <span className="whitespace-nowrap font-bold">{formatNpr(food.price)}</span>
                </div>
                <Button
                  onClick={() => navigate(`/restaurant/${food.restaurantId}`)}
                  variant="outline"
                  className="mt-5 w-full rounded-xl"
                >
                  View restaurant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Find your table</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Restaurants to explore</h2>
            <p className="mt-2 text-sm text-muted-foreground">Browse local kitchens and their menus.</p>
          </div>
          <Link to="/search/all" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading && allRestaurants.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : restaurantError && allRestaurants.length === 0 ? (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <h3 className="font-semibold">We couldn't load restaurants</h3>
            <p className="mt-2 text-sm text-muted-foreground">{restaurantError}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => getAllRestaurants()}>Try again</Button>
          </div>
        ) : allRestaurants.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allRestaurants.map((restaurant) => (
            <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <img src={restaurant.imageUrl} alt={restaurant.restaurantName} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold">{restaurant.restaurantName}</h3>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{restaurant.menus.length} items</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[restaurant.city, restaurant.country].filter(Boolean).join(", ")}
                  {restaurant.deliveryTime > 0 && ` · ${restaurant.deliveryTime} min delivery`}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {restaurant.cuisines.map((cuisine) => (
                    <span key={cuisine} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                      {cuisine}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-semibold text-primary">
                  Explore menu <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <h3 className="font-semibold">No restaurants yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon for local places and fresh menus.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HereSection;
