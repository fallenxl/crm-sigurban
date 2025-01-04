import { useState } from "react";
import { NavbarWithSearch } from "../component/navbar/Navbar";
import { Sidebar } from "../component/sidebar/Sidebar";

interface Props {
  children: React.ReactNode;
  title: string;
}

/**
 * Renders the layout component.
 * 
 * @param children - The content to be rendered inside the layout.
 * @param title - The title of the layout.
 * @returns The rendered layout component.
 */
export const Layout = ({ children, title }: Props) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const handleOpenSidebar = () => setOpenSidebar(!openSidebar);
  return (
    <>
      <div className="flex w-full min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 bg-[radial-gradient(rgba(0,0,0,0.09)_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <Sidebar openSidebar={openSidebar} handleOpenSidebar={setOpenSidebar} />
        <div className=" w-full px-2 md:px-7 py-5 ">
          <div className="w-full flex  justify-between items-center lg:flex-row  flex-col-reverse relative">
            <div className="w-full  p-4 flex flex-col ">
              <span className="text-xs text-blue-gray-500">
                {decodeURIComponent(window.location.pathname)}
              </span>
              <span className="text-xl font-bold text-blue-gray-700">
                {title}
              </span>
            </div>
            <NavbarWithSearch
              setOpenSidebar={handleOpenSidebar}
              openSidebar={openSidebar}
            />
          </div>
          <main className="p-4 relative w-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
      
    </>
  );
};
