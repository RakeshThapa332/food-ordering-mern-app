import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LoginInputState, userLoginSchema } from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [input, setInput] = useState<LoginInputState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginInputState>>({});
  const [showPassword, setShowPassword] = useState(false);
  const { loading, login } = useUserStore();
  const navigate = useNavigate();

  const changeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };
  const loginSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    const result = userLoginSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<LoginInputState>);
      return;
    }
    if (await login(input)) {
      navigate(useUserStore.getState().user?.isVerified ? "/" : "/verify-email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={loginSubmitHandler}
        className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="mb-4">
          <Link to="/" aria-label="FoodWorld home">
            <h1 className="font-bold text-2xl">FoodWorld</h1>
          </Link>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Email address</label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              name="email"
              required
              value={input.email}
              onChange={changeEventHandler}
              className="pl-10 focus-visible:ring-1"
            />
            <Mail className="absolute left-3 top-10 h-4 w-4 text-gray-500 pointer-events-none" />
            {errors.email && (
              <span role="alert" className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium">Password</label>
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              name="password"
              required
              minLength={6}
              value={input.password}
              onChange={changeEventHandler}
              className="pl-10 pr-12"
            />
            <LockKeyhole className="absolute left-3 top-10 h-4 w-4 text-gray-500 pointer-events-none" />
            <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-8 h-8 w-8">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {errors.password && (
              <span role="alert" className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>
        </div>
        <div>
          {loading ? (
            <Button disabled className="w-full bg-orange hover:bg-hoverOrange">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full bg-orange hover:bg-hoverOrange"
            >
              Login
            </Button>
          )}
          <div className="mt-4 text-right text-sm">
            <Link
              to="/forgot-password"
              className="hover:text-blue-500 hover:underline"
            >
              Forgot Password
            </Link>
          </div>
        </div>
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
