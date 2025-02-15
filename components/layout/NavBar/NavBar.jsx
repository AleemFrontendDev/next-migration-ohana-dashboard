"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trans, useTranslation } from "react-i18next";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import db from "@/firebase/firebase-config"
import useInterval, { BASE_URL } from "@/utils/common";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import '@/lib/i18n'
import Link from "next/link";

const languageOptions = [
  { name: "English", value: "en" },
  { name: "French", value: "fr" },
];

const Navbar = ({ isMenuOpen, setIsMenuOpen, isMobileMenuOpen, setisMobileMenuOpen }) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { countryChange } = useCountry();
  const { user } = useUser();
  const authToken = typeof window !== "undefined" ? localStorage.getItem("Auth Token") : null;

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("selectedCountry")) : null
  );
  const [selectedLanguageName, setSelectedLanguageName] = useState("English");

  useEffect(() => {
    const lang = localStorage.getItem("userSelectedLanguage");
    if (lang) {
      const parsedLang = JSON.parse(lang);
      i18n.changeLanguage(parsedLang.value);
      setSelectedLanguageName(parsedLang.name);
    } else {
      i18n.changeLanguage("en");
    }
  }, []);

  const changeLanguage = (lng) => {
    localStorage.setItem("userSelectedLanguage", JSON.stringify(lng));
    i18n.changeLanguage(lng.value);
    setSelectedLanguageName(lng.name);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
      });
      const jsonData = await response.json();
      if (jsonData.status !== 200) {
        localStorage.clear();
        router.push("/login");
      }
    } catch (e) {
      localStorage.clear();
      router.push("/login");
    }
  };

  useInterval(checkAuth, 5000);

  useEffect(() => {
    if (user && user.countries) {
      let country = user.selected_country
        ? user.countries.find((c) => c.id === user.selected_country)
        : user.countries[0];

      if (country) {
        const localStorageData = {
          id: country.id,
          flag: country.flag,
          name: country.nicename,
        };
        localStorage.setItem("selectedCountry", JSON.stringify(localStorageData));
        setSelectedCountry(localStorageData);
      }

      setCountries(user.countries.map((c) => ({ id: c.id, flag: c.flag, name: c.nicename })));
    }
  }, [user]);

  const changeCountry = async (country) => {
    const response = await fetch(`${BASE_URL}/country-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
      body: JSON.stringify({ country }),
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      localStorage.setItem("selectedCountry", JSON.stringify(country));
      setSelectedCountry(country);
      countryChange(country.id);
    }
  };

  const handleLogout = async () => {
    await signOut(db.auth);
    localStorage.removeItem("Auth Token");
    await fetch(`${BASE_URL}/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    router.push("/login");
  };

  return (
    <nav className={`fixed h-[60px] ${isMenuOpen ? "w-full md:w-[95%]" : "w-full md:w-[85%]"} z-50 flex items-center justify-between bg-white px-4 py-3`}>
      <div className="flex md:hidden items-center">
      <Image
        src={`/assets/images/logo-mini.png`}
        alt="Ohana Africa"
        className="w-full h-full object-cover"
        width={50}
        height={50}
      />
      </div>
      <Button variant="ghost" className="group focus:outline-none focus:ring-0 p-2 hidden md:block" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <Menu className="w-6 h-6 text-gray-800" />
      </Button>


      <div className="flex items-center space-x-4 mr-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1">
              <Globe className="w-5 h-5 text-gray-800" />
              <span>{selectedLanguageName}</span>
              <ChevronDown className="w-4 h-4 text-gray-800" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            {languageOptions.map((lng, index) => (
              <DropdownMenuItem key={index} onClick={() => changeLanguage(lng)}>
                {lng.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {countries.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center">
                {selectedCountry && (
                  <Image src={selectedCountry.flag} width={32} height={20} alt={selectedCountry.name} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
              {countries.map((country) => (
                <DropdownMenuItem key={country.id} onClick={() => changeCountry(country)}>
                  <Image src={country.flag} width={32} height={20} alt={country.name} />
                  <span>{country.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <ChevronDown className="w-2 h-4 text-gray-800" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
            <Link href="/support" className="text-black no-underline hover:no-underline">
                  <Trans>Check Inbox</Trans>
            </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" className="group focus:outline-none focus:ring-0 p-2 outline-none border-0 md:hidden block" onClick={() => setisMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6 text-gray-800" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;