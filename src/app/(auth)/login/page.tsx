"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mic } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";

import { loginSchema, LoginSchema } from "@/utils/schema/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/formInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const defaultValues: LoginSchema = {
  email: "",
  password: "",
};

export default function LogInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const signIn = useAuthStore((state) => state.signIn);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      await signIn(data);
      router.push(redirectTo);
    } catch (e: unknown) {
      console.log("Sign up error:", e);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary p-2 rounded-full">
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">
          Sign in to TalkAdvantage
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error.message}
              </div>
            )}
            <FormInput
              label="Email"
              name="email"
              type="text"
              placeholder="jon.doe@example.com"
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              description="Password must be at least 6 characters long"
              resetPassword={true}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
