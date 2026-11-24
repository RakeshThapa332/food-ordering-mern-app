import { useRestaurantStore } from "@/store/useRestaurantStore";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const FilterPage = () => {
  const { allRestaurants, setAppliedFilter, appliedFilter, resetAppliedFilter } = useRestaurantStore();
  const filterOptions = [...new Set(allRestaurants.flatMap((restaurant) => restaurant.cuisines))]
    .sort((first, second) => first.localeCompare(second));

  const appliedFilterHandler = (value: string) => {
    setAppliedFilter(value);
  };

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Cuisine</h2>
        <Button variant="link" className="h-auto p-0" onClick={resetAppliedFilter} disabled={appliedFilter.length === 0}>Clear</Button>
      </div>
      {filterOptions.length ? filterOptions.map((option) => (
        <div key={option} className="my-4 flex items-center gap-2">
          <Checkbox
            id={`cuisine-${option}`}
            checked={appliedFilter.includes(option)}
            onCheckedChange={() => appliedFilterHandler(option)}
          />
          <Label htmlFor={`cuisine-${option}`} className="cursor-pointer text-sm font-medium">
            {option}
          </Label>
        </div>
      )) : <p className="mt-4 text-sm text-muted-foreground">Cuisine filters appear when restaurants are available.</p>}
    </div>
  );
};

export default FilterPage;
