import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { RiHomeSmile2Line } from "react-icons/ri";
import { LuUsers } from "react-icons/lu";
import { TbCake } from "react-icons/tb";
import { TbHorseToy } from "react-icons/tb";
import logo from '../assets/logo_happy_kids.png';

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: "/", icon: "home", label: "Home" },
    { path: "/clientes", icon: "users", label: "Clientes" },
    { path: "/festas", icon: "paries", label: "Festas"},
    { path: "/brinquedos", icon: "toys", label: "Brinquedos" }
  ];

  const getIcon = (iconName: string, isActive: boolean) => {
    const strokeColor = isActive ? "#94E5CE" : "white";
      switch (iconName) {
        case "users":
          return (
            <LuUsers style={{ color: strokeColor, width: 27, height: 30 }}/>
          );
        case "home":
          return (
            <RiHomeSmile2Line style={{ color: strokeColor, width: 27, height: 30 }} />
          )
        case "paries":
          return (
            <TbCake style={{ color: strokeColor, width: 27, height: 30 }}/>
          )
        case "toys":
          return (
            <TbHorseToy style={{ color: strokeColor, width: 27, height: 30 }} />
          )
        default:
          return null;
    }
  };

  // Fecha sidebar ao clicar fora no mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && isMobileOpen && !sidebar.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  return (
    <div>
      {/* Topbar mobile */}
      <div className="flex md:hidden fixed top-0 left-0 right-0 h-14 bg-blue-600 flex items-center px-4 shadow z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 text-white hover:bg-blue-700 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <span className="ml-4 text-white text-sm">Happy Kids</span>
      </div>

      {/* Sidebar mobile */}
      <div
        id="sidebar"
        className={`md:hidden fixed top-0 left-0 h-screen w-[240px] bg-blue-600 shadow transition-transform duration-300 z-50 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
          <div className={`flex flex-col items-start min-h-screen bg-blue-600 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(0,0,0,0.10)] transition-all duration-300 w-[240px]`}>
          <div className="flex flex-col items-start gap-2 self-stretch">
            {/* Header */}
            <div className="flex pt-[30px] pb-3 flex-col items-start self-stretch">
                <div className="flex items-center gap-2 w-full px-4">
                  <div className="flex w-[55px] max-w-[65.4px] flex-col items-start flex-shrink-0">
                    <div className="flex max-w-[55px] flex-col items-start self-stretch">
                      <div className="flex h-[55px] flex-col justify-center items-center self-stretch">
                        <img
                          src={logo}
                          alt="Happy Kids Logo"
                          className="h-[55px] flex-shrink-0 self-stretch"
                          style={{ marginRight: "-5px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex-1 text-white font-bold text-lg"
                    style={{ marginLeft: "3px" }}
                  >
                    Happy Kids
                  </div>
                </div>
            </div>
            
            {/* Navigation */}
            <div className="flex pb-[526px] flex-col items-start self-stretch">
              <div
                className={`flex flex-col items-start gap-1 w-full px-2`}
              >
                {menuItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-start w-full`}
                    >
                      <div
                        className={`flex items-center justify-center self-stretch rounded-xl`}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center hover:bg-blue-700 rounded-xl transition-colors py-3 px-4 gap-3 w-full ${isActive ? "bg-blue-700" : ""}`}title={item.label}
                        >
                          {getIcon(item.icon, isActive)}
                          <span className="text-white font-medium text-sm">{item.label}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              
            {/* Logout Button */}
            <div className="flex py-5 flex-col items-start">
              <div
                className={`flex px-5 ml-10 w-full items-start`}
              >
                <button
                  className={`flex items-center hover:bg-blue-700 rounded-xl transition-colors py-3 px-4 gap-3 w-full"}`}title={"Sair"}
                >
                  <svg
                    width="29"
                    height="28"
                    viewBox="0 0 29 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                  >
                    <path
                      d="M11 24.5H6.33333C5.71449 24.5 5.121 24.2542 4.68342 23.8166C4.24583 23.379 4 22.7855 4 22.1667V5.83333C4 5.21449 4.24583 4.621 4.68342 4.18342C5.121 3.74583 5.71449 3.5 6.33333 3.5H11"
                      stroke="white"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.1667 19.8333L25 14L19.1667 8.16663"
                      stroke="white"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M25 14H11"
                      stroke="white"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className=" text-white font-medium text-sm">Sair</span>
                </button>
              </div>
            </div>
          </div>
          </div>
      </div>

      {/* Sidebar desktop */}
      <div
        className={`hidden md:flex flex-col items-start min-h-screen bg-blue-600 shadow transition-all duration-300 ${
          isExpanded ? "w-[240px]" : "w-[56px]"
        }`}
      >
        <div className={`flex flex-col items-start min-h-screen bg-blue-600 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(0,0,0,0.10)] transition-all duration-300 ${isExpanded ? "w-[240px]" : "w-[56px]"}`}>
          <div className="flex flex-col items-start gap-2 self-stretch">
            {/* Header */}
            <div className="flex pt-[30px] pb-3 flex-col items-start self-stretch">
              {isExpanded ? (
                <div className="flex items-center gap-2 w-full px-4">
                  <div className="flex w-[55px] max-w-[65.4px] flex-col items-start flex-shrink-0">
                    <div className="flex max-w-[55px] flex-col items-start self-stretch">
                      <div className="flex h-[55px] flex-col justify-center items-center self-stretch">
                        <img
                          src={logo}
                          alt="Happy Kids Logo"
                          className="h-[55px] flex-shrink-0 self-stretch"
                          style={{ marginRight: "-5px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex-1 text-white font-bold text-lg"
                    style={{ marginLeft: "3px" }}
                  >
                    Happy Kids
                  </div>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    title="Colapsar menu"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full px-1 gap-2">
                  <div className="flex w-[48px] h-[48px] flex-col justify-center items-center">
                    <img
                      src={logo}
                      alt="Happy Kids Logo"
                      className="w-[48px] h-[48px] object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 text-white hover:bg-blue-700 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                    title="Expandir menu"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 rotate-180"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>

                  </button>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex pb-[526px] flex-col items-start self-stretch">
              <div
                className={`flex flex-col items-start gap-1 ${isExpanded ? "w-full px-2" : "w-[55px]"}`}
              >
                {menuItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-start ${isExpanded ? "w-full" : "px-1 self-stretch"}`}
                    >
                      <div
                        className={`flex items-center ${isExpanded ? "w-full" : "justify-center self-stretch"} rounded-xl`}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center hover:bg-blue-700 rounded-xl transition-colors ${
                            isExpanded
                              ? "py-3 px-4 gap-3 w-full"
                              : "py-2 px-[10px] flex-1"
                          } ${isActive ? "bg-blue-700" : ""}`}
                          title={!isExpanded ? item.label : undefined}
                        >
                          {getIcon(item.icon, isActive)}
                          {isExpanded && (
                            <span className="text-white font-medium text-sm">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              
            {/* Logout Button */}
            <div className="flex py-5 flex-col items-start">
              <div
                className={`flex ${isExpanded ? "px-5 ml-8 w-full" : "pl-[6px] pr-[13.5px] justify-center"} items-start`}
              >
                <button 
                  className={`flex items-center hover:bg-blue-700 rounded-xl transition-colors ${
                    isExpanded ? "py-3 px-4 gap-3 w-full" : "p-2"
                  }`}
                  title={!isExpanded ? "Sair" : undefined}
                >
                  <svg
                    width="29"
                    height="28"
                    viewBox="0 0 29 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                  >
                    <path
                      d="M11 24.5H6.33333C5.71449 24.5 5.121 24.2542 4.68342 23.8166C4.24583 23.379 4 22.7855 4 22.1667V5.83333C4 5.21449 4.24583 4.621 4.68342 4.18342C5.121 3.74583 5.71449 3.5 6.33333 3.5H11"
                      stroke="white"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.1667 19.8333L25 14L19.1667 8.16663"
                      stroke="white"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M25 14H11"
                      stroke="white"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isExpanded && (
                    <span className=" text-white font-medium text-sm">Sair</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
