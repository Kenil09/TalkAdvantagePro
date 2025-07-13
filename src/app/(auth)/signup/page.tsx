"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupSchema, SignupSchema } from "@/utils/schema/signup.schema";
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
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaultValues: SignupSchema = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpPage() {
  const router = useRouter();

  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const signUp = useAuthStore((state) => state.signUp);

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  });

  const onSubmit = async (data: SignupSchema) => {
    try {
      await signUp(data);
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
        <CardTitle className="text-2xl text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your information to create a TalkAdvantage account
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
              label="Display Name"
              name="displayName"
              type="text"
              placeholder="Jon Doe"
            />
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
            />
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
