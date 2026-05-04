import { useState } from "react";
import { sideBar, SidebarPermission } from "../../Constants/SideBarMenu";
import { NavLink } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa6";
import { useUserStore } from "../../Store/UserStore";

export const MainSideBar = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  /** Returns true if the user is allowed to see an item with the given permission. */
  const canSee = (item: any): boolean => {
    // Items flagged superAdminOnly are only visible to super admins
    if (item.superAdminOnly) return isSuperAdmin;
    if (!item.permission) return true; // unrestricted item
    if (isSuperAdmin) return true;
    return permissions.some(
      (p) =>
        p.module === item.permission.module &&
        p.resource_type === item.permission.resource &&
        p.action === item.permission.action,
    );
  };

  // Build a filtered copy of the sidebar tree
  const filteredSidebar = sideBar
    .map((item: any) => {
      // Grouped item (has subHeading + nestedLinksNames)
      if (item.subHeading) {
        const filteredNested = (item.nestedLinksNames ?? [])
          .filter((n: any) => canSee(n))
          .map((n: any) => ({
            ...n,
            nestedLinks: (n.nestedLinks ?? []).filter((l: any) =>
              canSee(l),
            ),
          }))
          .filter((n: any) => n.nestedLinks.length > 0);

        if (filteredNested.length === 0) return null;
        return { ...item, nestedLinksNames: filteredNested };
      }

      // Direct link item
      if (!canSee(item)) return null;
      return item;
    })
    .filter(Boolean);

  return (
    <div className="h-fit">
      <SidebarDropdown routes={filteredSidebar} onLinkClick={onLinkClick} />
    </div>
  );
};

// drop down sidebar component
const SidebarDropdown = ({
  routes,
  onLinkClick,
}: {
  routes: any[];
  onLinkClick?: () => void;
}) => {
  return (
    <div className="w-full h-full">
      <p className="text-[12px] mt-5">MENU</p>
      {/* check for nested menu */}
      {routes.map((route, index) => (
        <div key={index} className="my-2 py-1">
          {route.subHeading ? (
            <NestedDropDown nestMenu={route} onLinkClick={onLinkClick} />
          ) : (
            <NavLink
              to={route.link}
              end={route.link === "/dashboard"}
              className={
                "w-full flex items-center gap-2 link text-xl lg:text-[14px] hover:pl-2 duration-100"
              }
              onClick={onLinkClick}
            >
              {route.icon}
              <span>{route.name}</span>
            </NavLink>
          )}
        </div>
      ))}
    </div>
  );
};

// nested drop down
const NestedDropDown = ({
  nestMenu,
  onLinkClick,
}: {
  nestMenu: any;
  onLinkClick?: () => void;
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <div className="mt-0.5">
        <p className="text-[12px]">{nestMenu?.subHeading}</p>
      </div>
      <div>
        {nestMenu?.nestedLinksNames?.map((item: any, index: number) => (
          <div key={index}>
            {/* Always add a key when mapping */}
            <div
              className="flex w-full py-1 items-center justify-between cursor-pointer"
              onClick={() => handleToggle(index)}
            >
              <div className="flex mt-2 items-center gap-2">
                {item.icon}
                <p className="font-normal text-xl lg:text-[14px] text-textColor">
                  {item.name}
                </p>
              </div>
              <FaAngleDown
                className={openIndex === index ? "rotate-180" : ""}
              />
            </div>
            {/* Only render if this specific index is active */}
            {openIndex === index && (
              <DropDown
                dropDownMenus={item.nestedLinks}
                onLinkClick={onLinkClick}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// drop down
const DropDown = ({
  dropDownMenus,
  onLinkClick,
}: {
  dropDownMenus: any[];
  onLinkClick?: () => void;
}) => {
  return (
    <div className="border-l flex py-2 flex-col ml-2 border-dashed">
      {dropDownMenus?.map((menu, index) => (
        <NavLink
          to={menu.link}
          key={index}
          className="link text-xl lg:text-[14px] py-1 pl-3 duration-100 hover:pl-5"
          onClick={onLinkClick}
        >
          {menu.name}
        </NavLink>
      ))}
    </div>
  );
};
