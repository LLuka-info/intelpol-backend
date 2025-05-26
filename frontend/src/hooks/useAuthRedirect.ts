import { useEffect } from "react";
import { useRouter } from "next/router";

export function useRedirectIfLoggedIn() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      router.replace("/"); 
    }
  }, [router]);
}

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      router.replace("/login"); 
    }
  }, [router]);
}
