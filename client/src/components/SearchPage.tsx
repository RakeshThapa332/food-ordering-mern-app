import { Link, useParams } from "react-router-dom";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Globe, MapPin, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { Restaurant } from "@/types/restaurantType";
import FilterPage from "./FilterPage";

const SearchPage = () => {
  const params = useParams();
  const searchText = params.text === "all" ? "" : (params.text ?? "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "deliveryTime">("name");
  const {
    loading,
    searchedRestaurant,
    searchRestaurant,
    getAllRestaurants,
    appliedFilter,
    searchError,
  } = useRestaurantStore();
  const restaurants = searchedRestaurant?.data ?? [];
  const activeSearchText = submittedQuery || searchText;

  useEffect(() => {
    getAllRestaurants();
  }, [getAllRestaurants]);

  useEffect(() => {
    searchRestaurant(activeSearchText, "", appliedFilter);
  }, [activeSearchText, appliedFilter, searchRestaurant]);

  const sortedRestaurants = [...restaurants].sort((first, second) =>
    sortBy === "deliveryTime"
      ? (first.deliveryTime || Number.MAX_SAFE_INTEGER) - (second.deliveryTime || Number.MAX_SAFE_INTEGER)
      : first.restaurantName.localeCompare(second.restaurantName)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Find something delicious</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Explore restaurants</h1>
      </div>
      <form className="mb-7 flex gap-2" onSubmit={(event) => {
        event.preventDefault();
        setSubmittedQuery(searchQuery.trim());
      }}>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            placeholder="Search restaurant or cuisine"
            aria-label="Search restaurant or cuisine"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 bg-card pl-10"
          />
        </div>
        <Button type="submit" className="h-12 bg-orange hover:bg-hoverOrange">Search</Button>
      </form>

      <div className="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <FilterPage />
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Finding restaurants..." : `${restaurants.length} ${restaurants.length === 1 ? "restaurant" : "restaurants"} found`}
            </p>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sort by
              <select
                className="h-10 rounded-lg border bg-card px-3 text-foreground"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "name" | "deliveryTime")}
              >
                <option value="name">Name</option>
                <option value="deliveryTime">Delivery time</option>
              </select>
            </label>
          </div>
          {loading ? (
            <SearchPageSkeleton />
          ) : searchError ? (
            <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <h2 className="font-semibold">We couldn't load restaurants</h2>
              <p className="mt-2 text-sm text-muted-foreground">{searchError}</p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => searchRestaurant(activeSearchText, "", appliedFilter)}>Try again</Button>
            </div>
          ) : sortedRestaurants.length === 0 ? (
            <NoResultFound searchText={activeSearchText} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedRestaurants.map((restaurant: Restaurant) => (
                <Card key={restaurant._id} className="overflow-hidden rounded-2xl bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.restaurantName}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <CardContent className="p-5">
                    <h2 className="text-lg font-bold">{restaurant.restaurantName}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin size={15} />{restaurant.city}</span>
                      {restaurant.country && <span className="inline-flex items-center gap-1"><Globe size={15} />{restaurant.country}</span>}
                    </div>
                    {restaurant.deliveryTime > 0 && <p className="mt-2 text-sm text-muted-foreground">{restaurant.deliveryTime} min delivery</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {restaurant.cuisines.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="rounded-full">{cuisine}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <Button asChild className="w-full bg-orange hover:bg-hoverOrange">
                      <Link to={`/restaurant/${restaurant._id}`}>View menu <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchPage;

const SearchPageSkeleton = () => {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <Card key={item} className="overflow-hidden rounded-2xl">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-20" /></div>
          </CardContent>
          <CardFooter className="p-4"><Skeleton className="h-10 w-full rounded-xl" /></CardFooter>
        </Card>
      ))}
    </div>
  );
};

const NoResultFound = ({ searchText }: { searchText: string }) => {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">
        No results found
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't find any results for "{searchText}". Try searching
        with a different term.
      </p>
      <Link to="/">
        <Button variant="outline" className="mt-5">
          Go Back to Home
        </Button>
      </Link>
    </div>
  );
};
