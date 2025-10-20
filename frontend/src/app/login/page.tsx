"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import DotGrid from "@/components/organisms/DotGrid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/molecules/card";
import { toast } from "sonner";
import { login } from "@/lib/api";
import { LoginFormField } from "@/components/molecules/login-form-field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const error = err.message.split(",");
      toast.error(error[0]);
    }
  };

  return (
    <div className="bg-[var(--color-bg-main)] relative h-screen w-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={4}
          gap={35}
          baseColor="#666666"
          activeColor="#e0e0e0"
          proximity={100}
          shockRadius={100}
          shockStrength={10}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <Card className="relative z-10 w-96 shadow-lg border-2 bg-[var(--color-bg-secondary)] border-[var(--color-border-sheet)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[var(--color-text-primary)]">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <LoginFormField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
            />
            <LoginFormField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              className="w-[60%] transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)] self-center mt-4"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
