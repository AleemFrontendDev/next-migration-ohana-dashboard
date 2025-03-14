"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Trans } from "react-i18next";
import {
  ChevronDown,
} from "lucide-react";
import { IoMdHome } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { FaMobileScreen } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { PiHandWithdrawFill } from "react-icons/pi";
import { ROUTES, SECTIONS } from "@/utils/common";
import { FaIdCard } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { MdPayments } from "react-icons/md";
import { BiSupport } from "react-icons/bi";


const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState([]);
  const [menuState, setMenuState] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log(user);
    if (user?.role_id && user.role?.permissions?.length) {
      setPermissions(user.role.permissions.map((doc) => doc.section) ?? []);
    } else {
      setPermissions(SECTIONS ?? []);
    }
  };

  const toggleMenuState = (key) => {
    setMenuState((prevState) => ({
      ...Object.fromEntries(Object.keys(prevState).map((k) => [k, false])),
      [key]: !prevState[key],
    }));
  };

  const isPathActive = (path) => pathname.startsWith(path);

  const links = [
    {
      href: ROUTES.dashboard,
      label: "Dashboard",
      icon: <IoMdHome className="mr-2" />,
    },
    {
      href: ROUTES.organization,
      label: "Organizations",
      icon: <MdDashboard className="mr-2" />,
    },
    {
      href: ROUTES.group,
      label: "Groups",
      icon: <HiUsers className="mr-2" />,
    },
    {
      href: ROUTES.device_update,
      label: "Device Update",
      icon: <FaMobileScreen className="mr-2" />,
    },
    {
      href: ROUTES.transactions,
      label: "Transactions",
      icon: <GrTransaction className="mr-2" />,
    },
    {
      href: ROUTES.withdraw_request,
      label: "Withdraw",
      icon: <PiHandWithdrawFill className="mr-2" />,
    },
    {
      href: ROUTES.customer,
      label: "Customers",
      icon: <FaUser className="mr-2" />,
    },
    {
      href: ROUTES.manual_payment,
      label: "Manual Payment",
      icon: <MdPayments className="mr-2" />,
    },
    {
      href: ROUTES.verify_request,
      label: "ID Verification",
      icon: <FaIdCard className="mr-2" />,
    },
    {
      href: ROUTES.support,
      label: "Support",
      icon: <BiSupport className="mr-2" />,
    },
  ];

  return (
    <>
      <nav
        className={`${
          isMenuOpen ? "w-[70px]" : "w-[330px]"
        } min-h-screen hidden md:block bg-[#ffbb22] text-black transition-all text-[15px] font-[540] overflow-auto`}
      >
        <div className={`flex items-center ${!isMenuOpen ? 'justify-between' : 'justify-center pl-4'} mb-8 pt-4`}>
          <Link href={ROUTES.dashboard} className={`${!isMenuOpen ? 'flex ml-10' : 'hidden'}`}>
            <Image
              src={`/assets/images/${
                isMenuOpen ? "logo-mini.png" : "logo.png"
              }`}
              alt="Ohana Africa"
              className="w-full h-full object-cover"
              width={150}
              height={0}
            />
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none focus:ring-0 "
            >
            <Image
              src={`/arrow.svg`}
              alt="Arrow icon"
              className={`mr-4 mb-2 cursor-pointer ${!isMenuOpen ? "" : "rotate-180"}`}
              width={15}
              height={15}
            />
          </button>
        </div>
        <ul className={` mt-20 ${isMenuOpen ? "pl-2" : "pl-8"}`}>
          {links.map(({ href, label, icon }) =>
            permissions.includes(label) ? (
              <li key={href} className={`${isMenuOpen ? "hover:pl-1" : "hover:pl-6"} w-full transition-all duration-300`}>
                <Link
                  href={href}
                  className={`
                    ${isMenuOpen ? "hover:pl-4" : "hover:pl-10"}
                    flex items-center p-3  hover:no-underline text-[#000] hover:text-black 
                    ${
                      isPathActive(href)
                        ? "bg-[linear-gradient(90deg,#0000,#fff)] text-black"
                        : "hover:bg-[linear-gradient(90deg,#0000,#fff)] hover:text-black"
                    }  
                    `}
                  >
                  {icon} {isMenuOpen ? "" : <Trans>{label}</Trans>}
                </Link>
              </li>
            ) : null
          )}
          {
            <li>
              <div
                className={`flex items-center justify-between p-3 cursor-pointer ${
                  isMenuOpen === true ? "hidden" : "flex"
                } ${
                  menuState.usersRolesManagementOpen === true
                    ? "bg-[linear-gradient(90deg,#0000,#fff)] text-black transition-all"
                    : ""
                }`}
                onClick={() => toggleMenuState("usersRolesManagementOpen")}
              >
                Users & Roles Management <ChevronDown width={12} />
              </div>
              {(
                <ul className={`${menuState.usersRolesManagementOpen === true ? 'h-[100px]' : 'h-0'} transition-all overflow-hidden`}>
                  <li>
                    <Link
                      href={ROUTES.roles}
                      className={`${
                        isPathActive(ROUTES.roles) ? "text-white border-white" : ""
                      } border-l-[3px] border-purple-700 hover:border-white flex items-center p-3 hover:text-white text-black transition-all duration-300 hover:no-underline hover:text-black"} ${
                        isMenuOpen ? "hover:pl-5" : "hover:pl-10"
                      }
                      ${isMenuOpen ? 'hidden' : ''}
                      `}
                    >
                      <Trans>Roles</Trans>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.users}
                      className={`${
                        isPathActive(ROUTES.users) ? "text-white border-white" : ""
                      } border-l-[3px] border-purple-700 hover:border-white flex items-center p-3 hover:text-white text-black transition-all duration-300 hover:no-underline hover:text-black"} ${
                        isMenuOpen ? "hover:pl-5" : "hover:pl-10"
                      }
                      ${isMenuOpen ? 'hidden' : ''}
                      `}
                    >
                      <Trans>Users</Trans>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          }
          {
            <li>
              <div
                className={`flex items-center justify-between p-3 cursor-pointer ${
                  isMenuOpen === true ? "hidden" : "flex"
                } ${
                  menuState.settingsOpen === true
                    ? "bg-[linear-gradient(90deg,#0000,#fff)] text-black"
                    : ""
                }`}
                onClick={() => toggleMenuState("settingsOpen")}
              >
                Settings <ChevronDown width={12} />
              </div>
              {(
                <ul className={`${menuState.settingsOpen === true ? 'h-[300px]' : 'h-0'} transition-all overflow-hidden`}>
                  <li>
                    <Link
                      href={ROUTES.payment_gateway}
                      className={`${
                        isPathActive(ROUTES.payment_gateway) ? "text-white border-white" : ""
                      } border-l-[3px] border-purple-700 hover:border-white flex items-center p-3 hover:text-white text-black transition-all duration-300 hover:no-underline hover:text-black"} ${
                        isMenuOpen ? "hover:pl-5" : "hover:pl-10"
                      }
                      ${isMenuOpen ? 'hidden' : ''}
                      `}
                    >
                      Payment Gateway
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.manual_payment_gateway}
                      className={`${
                        isPathActive(ROUTES.manual_payment_gateway)
                          ? "text-white border-white"
                          : ""
                      } border-l-[3px] border-purple-700 hover:border-white flex items-center p-3 hover:text-white text-black transition-all duration-300 hover:no-underline hover:text-black"} ${
                        isMenuOpen ? "hover:pl-5" : "hover:pl-10"
                      }
                      ${isMenuOpen ? 'hidden' : ''}
                      `}
                    >
                      Manual Payment Gateway
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.countries}
                      className={`${
                        isPathActive(ROUTES.countries) ? "text-white border-white" : ""
                      } border-l-[3px] border-purple-700 hover:border-white flex items-center p-3 hover:text-white text-black transition-all duration-300 hover:no-underline hover:text-black"} ${
                        isMenuOpen ? "hover:pl-5" : "hover:pl-10"
                      }
                      ${isMenuOpen ? 'hidden' : ''}
                      `}
                    >
                      Countries
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.currencies}
                      className={`${
                        isPathActive(ROUTES.currencies) ? "text-white border-white" : ""
                      } border-l-[3px] border-purple-700 hover:border-white flex items-center p-3 hover:text-white text-black transition-all duration-300 hover:no-underline hover:text-black"} ${
                        isMenuOpen ? "hover:pl-5" : "hover:pl-10"
                      }
                      ${isMenuOpen ? 'hidden' : ''}
                      `}
                    >
                      Currencies
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          }
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
