import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-12 bg-[#211d1a] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-xl font-extrabold tracking-tight">FoodWorld</Link>
          <p className="mt-2 max-w-md text-sm text-white/65">Discover local restaurants and make your next meal an easy one.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75" aria-label="Footer navigation">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/search/all" className="hover:text-white">Restaurants</Link>
          <Link to="/login" className="hover:text-white">Sign in</Link>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/15 pt-5 text-xs text-white/55">
        &copy; {new Date().getFullYear()} FoodWorld. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;