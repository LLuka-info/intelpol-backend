import { useEffect } from "react";
import { useRouter } from "next/router";

export function useRedirectIfLoggedIn() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      router.replace("/"); // redirect to home if logged in
    }
  }, [router]);
}

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      router.replace("/login"); // redirect to login if not logged in
    }
  }, [router]);
}
