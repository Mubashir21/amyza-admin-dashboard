"use client";

import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="size-8 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl">Check Your Email</CardTitle>

          <CardDescription className="space-y-2">
            <span>We've sent a confirmation link to:</span>
            <div className="font-semibold text-foreground">{email}</div>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  Next steps:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>Return to sign in</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            <p>Didn't receive the email? Check your spam folder.</p>
          </div>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
