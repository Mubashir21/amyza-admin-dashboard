"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendEmail, setResendEmail] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  // Function to resend confirmation email
  const resendConfirmation = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        setError("Failed to resend confirmation email: " + error.message);
      } else {
        setSuccessMessage("Confirmation email sent! Please check your inbox.");
        setError(null);
        setShowResendButton(false);
      }
    } catch (err) {
      setError("Failed to resend confirmation email.");
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setShowResendButton(false);

    try {
      await signIn(values.email, values.password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in.");
        setShowResendButton(true);
        setResendEmail(values.email);
      } else if (err.message.includes("Invalid login credentials")) {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else {
        setError(err.message || "An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 mb-6">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Student Portfolio System</span>
        </a>
        <h1 className="text-xl font-bold">Student Portfolio System</h1>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
          {showResendButton && (
            <button
              onClick={() => resendConfirmation(resendEmail)}
              disabled={isLoading}
              className="mt-2 text-blue-600 underline hover:text-blue-800 disabled:opacity-50 text-sm"
            >
              {isLoading ? "Sending..." : "Resend confirmation email"}
            </button>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@school.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="●●●●●●●●●●"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-xs text-muted-foreground">
        Need help accessing your account? Contact your administrator.
      </div>
    </div>
  );
}
