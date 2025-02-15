"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import Navbar from "@/components/layout/NavBar/NavBar";
import { useEffect, useState } from "react";
import Footer from "../layout/Footer/Footer";
import MobileSideBar from "../layout/MobileSideBar/MobileSideBar";

export default function LayoutWrapper({ children }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setisMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const excludedRoutes = ["/login", "/register"];
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("Auth Token");

    if (token && pathname === "/login") {
      router.push("/dashboard");
    } else if (!token && pathname !== "/login") {
      router.push("/login");
    } else {
      setAuthToken(token);
      setIsLoading(false);
    }
  }, [pathname, router]);

  if (isLoading) return null;

  return (
    <>
      {!excludedRoutes.includes(pathname) && <MobileSideBar isMobileMenuOpen={isMobileMenuOpen} setisMobileMenuOpen={setisMobileMenuOpen}/>}
      <div className="flex min-h-screen">
          {!excludedRoutes.includes(pathname) && <Sidebar isMenuOpen={isMenuOpen} />} 
          <div className="w-full">
          {!excludedRoutes.includes(pathname) && <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isMobileMenuOpen={isMobileMenuOpen} setisMobileMenuOpen={setisMobileMenuOpen} />}        
            <main className="flex flex-col justify-between pt-20 px-3 md:px-x pb-5 w-full h-full bg-[#f3f3f3]">
              <div>
                {children}
              </div>
              <div className="mt-40">
                <Footer/>
              </div>
            </main>
          </div>
      </div>
    </>
  );
}
