"use client"; 

import { useEffect, useState } from "react";

export function useAuthToken() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("Auth Token");
    setToken(storedToken);
  }, []);

  return token;
}
