import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MainSideBar } from "../Sidebar/MainSideBar";
import { UserProfile } from "../other/UserProfile";
import { FiColumns, FiX } from "react-icons/fi";
import { useState, useEffect, Suspense } from "react";
import { Loader } from "../other/Loader/Loader";
import { useUserStore } from "../../Store/UserStore";
import useFetchHook from "../../Hooks/UseFetchHook";
import "./Layout.css"; // Import CSS for animations

export const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const passwordMustChange = useUserStore((s) => s.passwordMustChange);
  const { data: unreadData } = useFetchHook<{ count: number }>(
    '/notifications/unread-count',
    'unread-count',
    { staleTime: 30_000 }
  );
  const unreadCount = unreadData?.count ?? 0;

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!passwordMustChange) return;
    const path = location.pathname.replace(/\/$/, "") || "/";
    if (path !== "/dashboard/settings") {
      navigate("/dashboard/settings?changePassword=true", { replace: true });
    }
  }, [passwordMustChange, location.pathname, navigate]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="mx-auto min-h-screen relative w-full bg-gray-50 flex gap-2 p-2">
      {/* side bar */}
      {/* mobile sidebar */}
      <div
        className={`w-full min-h-screen lg:hidden backdrop-blur-[2px] z-50 fixed top-0 left-0 backdrop-sepia-0 p-2 rounded-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="max-w-70 overflow-y-auto h-screen bg-white shadow-xl sidebar no-scrollbar z-30 sticky top-2 rounded-xl p-2">
          {/* logo */}
          <img
            src="/digisolLogo.png"
            alt="logo"
            className="object-fit"
          />
          {/* sidebar */}
          <MainSideBar onLinkClick={() => setIsMenuOpen(false)} />

          {/* close menu */}
          <div className="flex justify-end absolute top-2 right-2">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <FiX size={25} />
            </button>
          </div>
        </div>
      </div>
      {/* desktop sidebar */}
      <div className="hidden relative h-cover lg:flex rounded-xl">
        <div className="min-w-60 max-h-screen sidebar overflow-scroll no-scrollbar bg-background z-20 sticky top-2 rounded-xl p-2">
          {/* logo */}
          <img
            src="/digisolLogo.png"
            alt="logo"
            className="object-fit"
          />
          {/* sidebar */}
          <MainSideBar />
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        {/* main content section */}
        <div className="bg-background min-h-17 flex justify-between lg:justify-end items-center px-2 lg:px-4 w-full rounded-xl">
          {/* open menu */}
          <div className="lg:hidden flex">
            <FiColumns
              size={25}
              className="cursor-pointer opacity-50"
              onClick={toggleMenu}
            />
          </div>
          {/* user profile */}
          <div>
            <UserProfile notifications={unreadCount} />
          </div>
        </div>
        {/* main content */}
        <div className="w-full bg-background overflow-scroll rounded-xl p-2 lg:px-4 py-5 transition-all duration-300 ease-in-out animate-in fade-in-0 slide-in-from-right-2">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
