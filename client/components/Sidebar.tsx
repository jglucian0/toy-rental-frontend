import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { path: "/", icon: "home", label: "Home" },
    { path: "/clients", icon: "users", label: "Clientes" },
  ];

  const getIcon = (iconName: string, isActive: boolean) => {
    const strokeColor = isActive ? "#94E5CE" : "white";

    switch (iconName) {
      case "home":
        return (
          <svg
            width="33"
            height="36"
            viewBox="0 0 33 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M25.95 13.5585L18.7504 7.95871C18.1186 7.46718 17.341 7.20032 16.5405 7.20032C15.74 7.20032 14.9623 7.46718 14.3305 7.95871L7.12963 13.5585C6.69688 13.895 6.34675 14.326 6.106 14.8185C5.86524 15.311 5.74022 15.8521 5.74048 16.4003V26.1203C5.74048 26.8363 6.02494 27.5231 6.53129 28.0294C7.03764 28.5358 7.72439 28.8203 8.44048 28.8203H24.6405C25.3566 28.8203 26.0433 28.5358 26.5497 28.0294C27.056 27.5231 27.3405 26.8363 27.3405 26.1203V16.4003C27.3405 15.2892 26.8275 14.2403 25.95 13.5585Z"
              stroke={strokeColor}
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.9 22.05C18.9165 23.8495 14.0808 23.8495 11.1 22.05"
              stroke={strokeColor}
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "dashboard":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M4.5 6H11.25V15H4.5V6Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.5 19.5H11.25V24H4.5V19.5Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.75 15H22.5V24H15.75V15Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.75 6H22.5V10.5H15.75V6Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "users":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M5.625 9.375C5.625 10.5685 6.09911 11.7131 6.94302 12.557C7.78693 13.4009 8.93153 13.875 10.125 13.875C11.3185 13.875 12.4631 13.4009 13.307 12.557C14.1509 11.7131 14.625 10.5685 14.625 9.375C14.625 8.18153 14.1509 7.03693 13.307 6.19302C12.4631 5.34911 11.3185 4.875 10.125 4.875C8.93153 4.875 7.78693 5.34911 6.94302 6.19302C6.09911 7.03693 5.625 8.18153 5.625 9.375Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.375 25.125V22.875C3.375 21.6815 3.84911 20.5369 4.69302 19.693C5.53693 18.8491 6.68153 18.375 7.875 18.375H12.375C13.5685 18.375 14.7131 18.8491 15.557 19.693C16.4009 20.5369 16.875 21.6815 16.875 22.875V25.125"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 5.02124C18.968 5.26908 19.8259 5.83203 20.4386 6.62134C21.0513 7.41065 21.3838 8.38142 21.3838 9.38062C21.3838 10.3798 21.0513 11.3506 20.4386 12.1399C19.8259 12.9292 18.968 13.4922 18 13.74"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23.625 25.125V22.875C23.6193 21.8818 23.2852 20.9184 22.6747 20.135C22.0642 19.3515 21.2117 18.792 20.25 18.5438"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "finance":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M10.125 7.125H7.875C7.27826 7.125 6.70597 7.36205 6.28401 7.78401C5.86205 8.20597 5.625 8.77826 5.625 9.375V22.875C5.625 23.4717 5.86205 24.044 6.28401 24.466C6.70597 24.8879 7.27826 25.125 7.875 25.125H19.125C19.7217 25.125 20.294 24.8879 20.716 24.466C21.1379 24.044 21.375 23.4717 21.375 22.875V9.375C21.375 8.77826 21.1379 8.20597 20.716 7.78401C20.294 7.36205 19.7217 7.125 19.125 7.125H16.875"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.125 7.125C10.125 6.52826 10.3621 5.95597 10.784 5.53401C11.206 5.11205 11.7783 4.875 12.375 4.875H14.625C15.2217 4.875 15.794 5.11205 16.216 5.53401C16.6379 5.95597 16.875 6.52826 16.875 7.125C16.875 7.72174 16.6379 8.29403 16.216 8.71599C15.794 9.13795 15.2217 9.375 14.625 9.375H12.375C11.7783 9.375 11.206 9.13795 10.784 8.71599C10.3621 8.29403 10.125 7.72174 10.125 7.125Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.75 13.875H12.9375C12.4899 13.875 12.0607 14.0528 11.7443 14.3693C11.4278 14.6857 11.25 15.1149 11.25 15.5625C11.25 16.0101 11.4278 16.4393 11.7443 16.7557C12.0607 17.0722 12.4899 17.25 12.9375 17.25H14.0625C14.5101 17.25 14.9393 17.4278 15.2557 17.7443C15.5722 18.0607 15.75 18.4899 15.75 18.9375C15.75 19.3851 15.5722 19.8143 15.2557 20.1307C14.9393 20.4472 14.5101 20.625 14.0625 20.625H11.25"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 20.625V21.75M13.5 12.75V13.875"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "party":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M3.375 24H23.625V15C23.625 14.1049 23.2694 13.2464 22.6365 12.6135C22.0036 11.9806 21.1451 11.625 20.25 11.625H6.75C5.85489 11.625 4.99645 11.9806 4.36351 12.6135C3.73058 13.2464 3.375 14.1049 3.375 15V24Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 6L15.1481 7.84275C15.4422 8.15891 15.6391 8.55302 15.7153 8.97804C15.7916 9.40306 15.7439 9.84104 15.578 10.2397C15.4121 10.6384 15.1349 10.9808 14.7797 11.2263C14.4245 11.4718 14.0061 11.6098 13.5745 11.624C13.1429 11.6382 12.7164 11.5279 12.3458 11.3062C11.9752 11.0846 11.6763 10.761 11.4846 10.3741C11.2929 9.98719 11.2165 9.55329 11.2647 9.12418C11.3129 8.69508 11.4835 8.2889 11.7562 7.95412L13.5 6Z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "toys":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <rect
              x="4.5"
              y="12"
              width="18"
              height="12"
              rx="2"
              stroke={strokeColor}
              strokeWidth="1.125"
            />
            <circle
              cx="13.5"
              cy="8"
              r="2"
              stroke={strokeColor}
              strokeWidth="1.125"
            />
            <path
              d="m13.5 10 0 2"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
            />
          </svg>
        );
      case "calendar":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M18 3.75V8.25"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 3.75V8.25"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.375 12.75H23.625"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="3.375"
              y="6"
              width="20.25"
              height="18.75"
              rx="2.25"
              stroke={strokeColor}
              strokeWidth="1.125"
            />
          </svg>
        );
      case "reports":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "settings":
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <circle
              cx="13.5"
              cy="15"
              r="3"
              stroke={strokeColor}
              strokeWidth="1.125"
            />
            <path
              d="M13.5 1.5V4.5M13.5 25.5V28.5M23.485 7.515L21.364 9.636M5.636 20.364L3.515 22.485M26.5 15H23.5M3.5 15H0.5M23.485 22.485L21.364 20.364M5.636 9.636L3.515 7.515"
              stroke={strokeColor}
              strokeWidth="1.125"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return (
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[27px] h-[30px]"
          >
            <circle
              cx="13.5"
              cy="15"
              r="3"
              stroke={strokeColor}
              strokeWidth="1.125"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`flex flex-col items-start min-h-screen bg-blue-600 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(0,0,0,0.10)] transition-all duration-300 ${isExpanded ? "w-[240px]" : "w-[56px]"}`}
    >
      <div className="flex flex-col items-start gap-2 self-stretch">
        {/* Header */}
        <div className="flex pt-[30px] pb-3 flex-col items-start self-stretch">
          {isExpanded ? (
            <div className="flex items-center gap-2 w-full px-4">
              <div className="flex w-[55px] max-w-[65.4px] flex-col items-start flex-shrink-0">
                <div className="flex max-w-[55px] flex-col items-start self-stretch">
                  <div className="flex h-[55px] flex-col justify-center items-center self-stretch">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/f8fb57aef46fe2c1f4c2a0961cb9895a722a9127?width=110"
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
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f8fb57aef46fe2c1f4c2a0961cb9895a722a9127?width=110"
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
            className={`flex ${isExpanded ? "px-4 w-full" : "pl-[6px] pr-[13.5px] justify-center"} items-start`}
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
  );
}
