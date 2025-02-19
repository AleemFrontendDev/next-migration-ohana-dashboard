"use client";

import * as Tabs from '@radix-ui/react-tabs';
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
import { useAuthToken } from '@/utils/useAuthToken';

const languageOptions = [
  { name: "English", value: "en" },
  { name: "French", value: "fr" },
];

const Navbar = ({ isMenuOpen, setIsMenuOpen, isMobileMenuOpen, setisMobileMenuOpen }) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { countryChange } = useCountry();
  const { user } = useUser();
  const authToken = useAuthToken();

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("selectedCountry")) : null
  );
  const [selectedLanguageName, setSelectedLanguageName] = useState("English");

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const firstName = loggedInUser ? loggedInUser.first_name : undefined;
  const lastName = loggedInUser ? loggedInUser.last_name : undefined;

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
    <nav className={`fixed ${isMenuOpen ? "w-full md:w-[95%]" : "w-full md:w-[85%]"} z-50 flex flex-col md:flex-row items-center justify-between bg-black px-4 py-3`}>

      <div className="flex items-center space-x-4 w-full md:w-auto ml-10 md:m-0">
        <div className="flex md:hidden items-center">
        <Image
          src={`/assets/images/logo-mini.png`}
          alt="Ohana Africa"
          className="w-full h-full object-cover"
          width={50}
          height={50}
        />
        </div>
        <button className="group focus:outline-none focus:ring-0 p-2 md:block" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="w-6 h-6 text-white group-hover:text-black" />
        </button>

        <Tabs.Root
          defaultValue="user-groups"
          className="flex items-center space-x-2 md:space-x-4 bg-white text-black p-1 rounded-lg w-full md:w-auto overflow-auto"
        >
          <Tabs.List className="flex space-x-1 md:space-x-2">
            <Tabs.Trigger
              value="user-groups"
              className="px-3 md:px-4 py-2 text-md font-medium rounded-lg focus:outline-none transition-colors 
                data-[state=active]:bg-[#F5BE4A] data-[state=active]:text-black"
            >
              User Groups
            </Tabs.Trigger>
            <Tabs.Trigger
              value="org-groups"
              className="px-3 md:px-4 py-2 text-md font-medium rounded-lg focus:outline-none transition-colors 
                data-[state=active]:bg-[#ffbb22] data-[state=active]:text-black"
            >
              Org Groups
            </Tabs.Trigger>
            <Tabs.Trigger
              value="open-saving-groups"
              className="px-3 md:px-4 py-2 text-md font-medium rounded-lg focus:outline-none transition-colors 
                data-[state=active]:bg-[#ffbb22] data-[state=active]:text-black"
            >
              Open Saving Groups
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>


      <div className="flex items-center space-x-4 mr-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 bg-white p-2">
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
            <Button variant="ghost" className='bg-white p-3'>
              <div className="hidden md:block text-black text-left text-md">
                <p className="font-medium">{firstName} {lastName}</p>
                <p className="text-xs text-gray-400">{lastName}</p>
              </div>
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