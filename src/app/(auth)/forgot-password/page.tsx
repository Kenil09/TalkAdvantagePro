"use client";

import { FormProvider, useForm } from "react-hook-form";
import Link from "next/link";
import { Mic } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
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
import {
  ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/utils/schema/forgotpassword.schema";
import { useRouter } from "next/navigation";

const defaultValues: ForgotPasswordSchema = {
  email: "",
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await forgotPassword({ email: data.email });
      router.push("/");
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
        <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email to reset your password
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Sending Reset Password Link..."
                : "Send Reset Password Link"}
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
