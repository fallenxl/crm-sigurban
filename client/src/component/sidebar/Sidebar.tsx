import React, { Dispatch, SetStateAction, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getLocalStorageRole } from "../../utils";
import { Roles } from "../../constants";
import { LogoSigUrban } from "../logo/LogoSigUrban";
import { indexRoutes } from "../../routes/index.routes";
interface Props {
  openSidebar: boolean;
  handleOpenSidebar: Dispatch<SetStateAction<boolean>>;
}

export function Sidebar({ openSidebar, handleOpenSidebar }: Props) {
  const [openItemMenu, setOpenItemMenu] = useState(0);
  const role = getLocalStorageRole();
  const handleOpenItemMenu = (value: number) => setOpenItemMenu(openItemMenu === value ? 0 : value);


  return (
    <aside className={`fixed h-screen bg-white z-30 top-0 ${openSidebar ? 'w-72' : ' w-20 -left-[100px]'} lg:left-0 lg:sticky border-r shadow-sm duration-300`}>
      {/* Toggle sidebar button */}
      <div onClick={() => handleOpenSidebar(!openSidebar)} className={`${openSidebar ? 'block' : 'hidden'} lg:block absolute top-[4.7em] -right-5 bg-white border-2 rounded-full p-2 cursor-pointer hover:bg-blue-gray-50`}>
        <ChevronRightIcon className={`h-5 w-5 ${openSidebar && 'rotate-180'} text-gray-700`} />
      </div>

      {/* Sidebar header */}
      <div className="flex w-full py-4 px-5 items-center justify-center gap-x-2 h-24 border-b">
        {/* <img src="https://api.dicebear.com/5.x/initials/svg?seed=Axl" alt="avatar" className="w-10 h-10 rounded-full" /> */}
        <LogoSigUrban className="w-20 h-20 "/>
        {/* <h1 className={`text-gray-800 font-bold ${openSidebar ? 'duration-[.5s]' : 'scale-0'}`}>Naranja y Media</h1> */}
      </div>
      {/* Sidebar body */}
      <ul onMouseOver={() => handleOpenSidebar(true)} className="pt-4 px-5">
        {role && indexRoutes[role as Roles].map((route, index) => {
          return (
            <React.Fragment key={route.path || route.label}>
              <li onClick={() => handleOpenItemMenu(index + 1)} className={`p-2 flex justify-between text-sm text-gray-700 cursor-pointer mb-4 hover:bg-gray-100 rounded-md`}>
                {!route.submenu && route.path ? (
                  <Link to={route.path} className="flex items-center gap-x-4">
                    {route.icon && React.cloneElement(route.icon, { className: 'w-5 h-5' })}
                    <span className={`${openSidebar ? '' : 'hidden'}`}>{route.label}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-x-4">
                    {route.icon && React.cloneElement(route.icon, { className: 'w-5 h-5' })}
                    <span className={`${openSidebar ? '' : 'hidden'}`}>{route.label}</span>
                  </div>
                )}
                {route.sub?.length && <ChevronDownIcon className={`w-5 h-5 ${openItemMenu === index + 1 && 'rotate-180'}`} />}
              </li>
              {openSidebar && route.sub?.map((subRoute) => {
                return (

                  <React.Fragment key={subRoute.path || subRoute.label}>

                    {subRoute.path && subRoute.label && <Link to={subRoute.path} className={`${openItemMenu !== index + 1 && 'hidden'} 
                  flex items-center gap-x-4 text-xs text-gray-700 mb-2 
                   hover:bg-gray-100 p-2 rounded-md`}>
                      <ChevronRightIcon className="w-5 h-5" />
                      <span className="w-full">{subRoute.label}</span>
                    </Link>}
                  </React.Fragment>

                );
              })}
            </React.Fragment>
          );
        })}
      </ul>
    </aside>
  );
}
