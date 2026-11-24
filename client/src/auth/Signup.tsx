import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignupInputState, userSignupSchema } from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, PhoneOutgoing, User } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";

// typescript me type define krne ka 2 trika hota hai

const Signup = () => {
    const [input, setInput] = useState<SignupInputState>({
        fullname:"",
        email:"",
        password:"", 
        contact:"", 
    });
    const [errors, setErrors] = useState<Partial<SignupInputState>>({});
    const [showPassword, setShowPassword] = useState(false);
    const {signup, loading} = useUserStore();
const navigate = useNavigate();
    const changeEventHandler = (e:ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setInput({...input, [name]:value});
    }
    const loginSubmitHandler = async (e:FormEvent) => {
        e.preventDefault();
        // form validation check start
        const result = userSignupSchema.safeParse(input);
        if(!result.success){
            const fieldErrors = result.error.formErrors.fieldErrors;
            setErrors(fieldErrors as Partial<SignupInputState>);
            return;
        }
        // login api implementation start here
        if (await signup(input)) navigate("/verify-email");
    }
  
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
    <form onSubmit={loginSubmitHandler} className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-4">
          <Link to="/" aria-label="FoodWorld home">
            <h1 className="font-bold text-2xl">FoodWorld</h1>
          </Link>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Label htmlFor="signup-name">Full name</Label>
            <Input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              name="fullname"
              required
              value={input.fullname}
              onChange={changeEventHandler}
              className="mt-2 pl-10 focus-visible:ring-1"
            />
            <User className="absolute left-3 top-10 h-4 w-4 text-gray-500 pointer-events-none" />
            {errors.fullname && <span role="alert" className="text-xs text-red-500">{errors.fullname}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Label htmlFor="signup-email">Email address</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              name="email"
              required
              value={input.email}
              onChange={changeEventHandler}
              className="mt-2 pl-10 focus-visible:ring-1"
            />
            <Mail className="absolute left-3 top-10 h-4 w-4 text-gray-500 pointer-events-none" />
            {errors.email && <span role="alert" className="text-xs text-red-500">{errors.email}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              name="password"
              required
              minLength={6}
              value={input.password}
              onChange={changeEventHandler}
              className="mt-2 pl-10 pr-12 focus-visible:ring-1"
            />
            <LockKeyhole className="absolute left-3 top-10 h-4 w-4 text-gray-500 pointer-events-none" />
            <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-8 h-8 w-8">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {errors.password && <span role="alert" className="text-xs text-red-500">{errors.password}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Label htmlFor="signup-contact">Contact number</Label>
            <Input
              id="signup-contact"
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit number"
              name="contact"
              required
              maxLength={10}
              value={input.contact}
              onChange={changeEventHandler}
              className="mt-2 pl-10 focus-visible:ring-1"
            />
            <PhoneOutgoing className="absolute left-3 top-10 h-4 w-4 text-gray-500 pointer-events-none" />
            {errors.contact && <span role="alert" className="text-xs text-red-500">{errors.contact}</span>}
          </div>
        </div>
        <div className="mb-10">
          {loading ? (
            <Button disabled className="w-full bg-orange hover:bg-hoverOrange">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full bg-orange hover:bg-hoverOrange">
              Signup
            </Button>
          )}
        </div>
        <Separator/>
        <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
