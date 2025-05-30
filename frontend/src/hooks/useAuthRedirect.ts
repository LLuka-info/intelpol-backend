import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function redirectDacaLogat() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      router.replace("/"); 
    }
  }, [router]);
}

function useRedirectDacaNelogat() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  return checking;
}

export {
  redirectDacaLogat, 
  useRedirectDacaNelogat 
};