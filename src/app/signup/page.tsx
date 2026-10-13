import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Sign up · Phrasa" };

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
