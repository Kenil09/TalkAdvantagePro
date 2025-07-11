"use client";

import { FormProvider, useForm } from "react-hook-form";
import Link from "next/link";
import { Mic } from "lucide-react";
import { useAuth } from "@/context/auth.context";
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

import { useRouter } from "next/navigation";
import {
  ResetPasswordSchema,
  resetPasswordSchema,
} from "@/utils/schema/resetpassword.schema";

const defaultValues: ResetPasswordSchema = {
  password: "",
};

export default function ResetPasswordPage() {
  const router = useRouter();

  const { isLoading, error, resetPassword } = useAuth();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await resetPassword({ password: data.password });
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
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your password to reset your password
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
              label="Reset Password"
              name="password"
              type="password"
              placeholder="Enter your password"
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
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
