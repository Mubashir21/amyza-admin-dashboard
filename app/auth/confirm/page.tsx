import { redirect } from "next/navigation";
import { ConfirmEmailClient } from "@/components/confirm-email-content";

interface PageProps {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
  }>;
}

export default async function ConfirmEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token_hash;
  const type = params.type;

  // If no token, redirect to signup with error
  if (!token) {
    redirect("/signup?error=Invalid confirmation link");
  }

  return <ConfirmEmailClient token={token} type={type} />;
}
