import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api, { getApiErrorMessage } from "@/lib/api";
import { LoginInputState, SignupInputState } from "@/schema/userSchema";
import { toast } from "sonner";

type User = {
    fullname:string;
    email:string;
    contact:number;
    address:string;
    city:string;
    country:string;
    profilePicture:string;
    admin:boolean;
    isVerified:boolean;
}

type UserState = {
    user: User | null;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    loading: boolean;
    signup: (input:SignupInputState) => Promise<boolean>;
    login: (input:LoginInputState) => Promise<boolean>;
    verifyEmail: (verificationCode: string) => Promise<boolean>;
    checkAuthentication: () => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email:string) => Promise<void>; 
    resetPassword: (token:string, newPassword:string) => Promise<boolean>; 
    updateProfile: (input: Partial<Pick<User, "fullname" | "address" | "city" | "country" | "profilePicture">>) => Promise<void>;
}

export const useUserStore = create<UserState>()(persist((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    loading: false,
    // signup api implementation
    signup: async (input: SignupInputState) => {
        try {
            set({ loading: true });
            const response = await api.post("/user/signup", input, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) { 
                toast.success(response.data.message);
                set({ loading: false, user: response.data.user, isAuthenticated: true });
                return true;
            }
            set({ loading: false });
            return false;
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not create your account."));
            set({ loading: false });
            return false;
        }
    },
    login: async (input: LoginInputState) => {
        try {
            set({ loading: true });
            const response = await api.post("/user/login", input, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) { 
                toast.success(response.data.message);
                set({ loading: false, user: response.data.user, isAuthenticated: true });
                return true;
            }
            set({ loading: false });
            return false;
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not sign in."));
            set({ loading: false });
            return false;
        }
    },
    verifyEmail: async (verificationCode: string) => {
        try {
            set({ loading: true });
            const response = await api.post("/user/verify-email", { verificationCode }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false, user: response.data.user, isAuthenticated: true });
                return true;
            }
            set({ loading: false });
            return false;
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not verify your email."));
            set({ loading: false });
            return false;
        }
    },
    checkAuthentication: async () => {
        try {
            set({ isCheckingAuth: true });
            const response = await api.get("/user/check-auth");
            if (response.data.success) {
                set({user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
            }
        } catch {
            set({user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
    logout: async () => {
        try {
            set({ loading: true });
            const response = await api.post("/user/logout");
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false, user: null, isAuthenticated: false })
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not sign out."));
            set({ loading: false });
        }
    },
    forgotPassword: async (email: string) => {
        try {
            set({ loading: true });
            const response = await api.post("/user/forgot-password", { email });
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false });
            } else {
                set({ loading: false });
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not send the reset link."));
            set({ loading: false });
        }
    },
    resetPassword: async (token: string, newPassword: string) => {
        try {
            set({ loading: true });
            const response = await api.post(`/user/reset-password/${token}`, { newPassword });
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false });
                return true;
            }
            set({ loading: false });
            return false;
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not reset your password."));
            set({ loading: false });
            return false;
        }
    },
    updateProfile: async (input: Partial<Pick<User, "fullname" | "address" | "city" | "country" | "profilePicture">>) => {
        try { 
            const response = await api.put("/user/profile/update", input,{
                headers:{
                    'Content-Type':'application/json'
                }
            });
            if(response.data.success){
                toast.success(response.data.message);
                set({user:response.data.user, isAuthenticated:true});
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not update your profile."));
        }
    }
}),
    {
        name: 'user-name',
        storage: createJSONStorage(() => localStorage),
    }
))