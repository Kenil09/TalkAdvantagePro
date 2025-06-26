import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type FormInputProps = {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  resetPassword?: boolean;
};

const FormInput = ({
  type,
  label,
  name,
  placeholder,
  description,
  resetPassword,
}: FormInputProps) => {
  const { control } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);

  switch (type) {
    case "text":
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "password":
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{label}</FormLabel>
                {resetPassword && (
                  <Link
                    href="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={placeholder}
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    size="icon"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    default:
      return null;
  }
};

export default FormInput;
