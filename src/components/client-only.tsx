"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly component ensures its children only render on the client side.
 * This prevents hydration mismatches for components that depend on browser APIs
 * or client-side state.
 *
 * @param children - The content to render only on the client side
 * @param fallback - Optional content to render during server-side rendering
 *
 * @example
 * ```tsx
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <ComponentThatUsesWindow />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AuthenticatedOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  unauthenticatedFallback?: React.ReactNode;
}

/**
 * AuthenticatedOnly component renders its children only when the user is authenticated.
 *
 * This component focuses solely on authentication checks. For client-side only rendering,
 * compose it with the ClientOnly component:
 *
 * @param children - The content to render when user is authenticated
 * @param fallback - Optional content to render during session loading
 * @param unauthenticatedFallback - Optional content to render when user is not authenticated
 *
 * @example
 * Basic usage (client-side components):
 * ```tsx
 * <AuthenticatedOnly
 *   fallback={<div>Loading...</div>}
 *   unauthenticatedFallback={<div>Please sign in</div>}
 * >
 *   <UserDashboard />
 * </AuthenticatedOnly>
 * ```
 *
 * @example
 * Composed with ClientOnly (for SSR safety + auth):
 * ```tsx
 * <ClientOnly fallback={<Skeleton />}>
 *   <AuthenticatedOnly
 *     fallback={<div>Checking auth...</div>}
 *     unauthenticatedFallback={<SignInPrompt />}
 *   >
 *     <ProtectedContent />
 *   </AuthenticatedOnly>
 * </ClientOnly>
 * ```
 */
export function AuthenticatedOnly({
  children,
  fallback = null,
  unauthenticatedFallback = null,
}: AuthenticatedOnlyProps) {
  const { data: session, status } = useSession();

  // Show fallback while session is loading
  if (status === "loading") {
    return <>{fallback}</>;
  }

  // Show unauthenticated fallback if user is not logged in
  if (!session) {
    return <>{unauthenticatedFallback}</>;
  }

  // Render children only when authenticated
  return <>{children}</>;
}
