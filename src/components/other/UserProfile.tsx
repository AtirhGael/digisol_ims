import { useEffect, useState } from "react";
import { FaAngleDown, FaUser } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaGear, FaBell } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../../Store/UserStore";
import { useAuth } from "../../Hooks/useAuth";

interface UserProfileProps {
  notifications?: number;
}

export const UserProfile = ({
  notifications,
}: UserProfileProps) => {
  const [Open, setOpen] = useState(true);
  // close the menu when the route changes
  const location = useLocation();
  // getting user data from the store
  const user = useUserStore((state) => state.user);
  useEffect(() => {
    // This code runs every time the route changes
    setOpen(false);
  }, [location]);
  // logout
  const { logout } = useAuth();

  return (
    <div className="relative">
      <div className="flex items-center gap-9">
        {/* notification */}
        <Link
          to={"/dashboard/notifications"}
          className="relative cursor-pointer"
        >
          <FaBell className="text-3xl text-primary" />
          {typeof notifications === 'number' && notifications > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notifications}
            </span>
          )}
        </Link>
        <div
          onClick={() => setOpen(!Open)}
          className="flex gap-4 items-center group cursor-pointer"
        >
          <img
            src={
              user?.avatar_url ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7csvPWMdfAHEAnhIRTdJKCK5SPK4cHfskow&s"
            }
            alt="user avatar"
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-cover rounded-full"
          />
          <div className="hidden lg:block">
            <p className="font-semibold">
              {user?.first_name || user?.firstName} {user?.last_name || user?.lastName}
            </p>
            <p className="text-sm text-gray-500">@{user?.roles[0]}</p>
          </div>
          <FaAngleDown />
        </div>
      </div>

      {/* drop down */}
      <div>
        {Open && (
          <div className="absolute top-13 right-0 z-10 border border-gray-200 bg-white flex flex-col gap-2 rounded-[20px] w-48 p-2">
            <Link
              to={"/dashboard/settings"}
              className="px-4 py-2 hover:bg-gray-100 group cursor-pointer flex gap-3 items-center rounded-[10px]"
            >
              <FaUser className="inline text-lg group-hover:text-primary" />
              <p className="group-hover:text-primary">My Profile</p>
            </Link>
            <Link
              to={"/dashboard/settings"}
              className="px-4 py-2 hover:bg-gray-100 group cursor-pointer flex gap-3 items-center rounded-[10px]"
            >
              <FaGear className="inline text-lg group-hover:text-primary" />
              <p className="group-hover:text-primary">Settings</p>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 cursor-pointer flex gap-3 items-center rounded-[10px] hover:ml-3 duration-200"
            >
              <img src="/src/Assets/log-out.png" alt="log out icon" />
              <p>Logout</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
