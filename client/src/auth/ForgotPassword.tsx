import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/store/useUserStore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword, loading } = useUserStore();

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await forgotPassword(email.trim());
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <form onSubmit={submitHandler} className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-primary dark:bg-orange-950">
            <Mail className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your account email and we'll send a reset link.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-orange hover:bg-hoverOrange">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remembered it? <Link to="/login" className="font-semibold text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
