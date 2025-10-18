"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { LogOut, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Logout = () => {
  const [status, setStatus] = useState<"logging-out" | "success">(
    "logging-out",
  );

  useEffect(() => {
    const performLogout = async () => {
      // Show logging out state for a moment
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");

      // Wait a bit to show success state
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Then sign out
      signOut({
        redirectTo: "/",
      });
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardContent className="pt-12 pb-12 px-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              {status === "logging-out" ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <div className="relative bg-primary/10 rounded-full p-6">
                    <LogOut className="size-12 text-primary animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                  <div className="relative bg-green-500/10 rounded-full p-6">
                    <CheckCircle2 className="size-12 text-green-600 animate-in zoom-in duration-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="space-y-3">
              {status === "logging-out" ? (
                <>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Logging Out
                  </h2>
                  <p className="text-muted-foreground">
                    Please wait while we sign you out...
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-green-600">
                    Success!
                  </h2>
                  <p className="text-muted-foreground">
                    You&apos;ve been logged out successfully
                  </p>
                </>
              )}
            </div>

            {/* Loading indicator */}
            <div className="flex justify-center gap-1.5 pt-2">
              <div className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="size-2 bg-primary/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
