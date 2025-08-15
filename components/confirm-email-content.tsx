"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConfirmEmailClientProps {
  token: string;
  type?: string;
}

export function ConfirmEmailClient({ token, type }: ConfirmEmailClientProps) {
  const [status, setStatus] = useState<"confirming" | "success" | "error">(
    "confirming"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          setStatus("success");
          setMessage("Email confirmed successfully!");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?message=Email confirmed! You can now sign in.");
          }, 3000);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage("Failed to confirm email");
        }
        setStatus("error");
      }
    };

    confirmEmail();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "confirming" && (
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="size-6 text-primary animate-spin" />
              </div>
            )}

            {status === "success" && (
              <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
              </div>
            )}

            {status === "error" && (
              <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <XCircle className="size-6 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          <CardTitle className="text-xl">
            {status === "confirming" && "Confirming your email..."}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>

          <CardDescription>
            {status === "confirming" &&
              "Please wait while we verify your email address."}
            {status === "success" && (
              <>
                {message}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  Redirecting to login page...
                </span>
              </>
            )}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>

        {status === "error" && (
          <CardContent className="text-center">
            <Button onClick={() => router.push("/signup")} className="w-full">
              Try Signing Up Again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
