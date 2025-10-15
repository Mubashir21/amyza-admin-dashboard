import { Suspense } from "react";
import { SignupForm } from "@/components/signup-form";

function SignupFormWrapper() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupFormWrapper />
      </div>
    </div>
  );
}
