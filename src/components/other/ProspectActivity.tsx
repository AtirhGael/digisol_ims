import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { getProspectionStatusInfo } from "@/lib/utils";

interface activityProps {
  FBN: string;
  location: string;
  date: string;
  status: string;
  amount: string;
}

export const ProspectActivity = ({
  FBN,
  location,
  date,
  status,
  amount,
}: activityProps) => {
  const statusInfo = getProspectionStatusInfo(status);

  return (
    <div className="flex hover:bg-gray-50 p-3 md:p-4 rounded-lg cursor-pointer duration-150 justify-between items-start md:items-center gap-3 border border-transparent hover:border-gray-200 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-medium text-gray-600 truncate">
          {FBN}
        </p>
        <div className="flex items-center gap-1.5 text-xs md:text-sm text-textColor mt-1.5 truncate">
          <FaLocationDot className="flex-shrink-0" />
          <p className="truncate">{location}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-end md:items-center flex-shrink-0">
        <p
          className={`${statusInfo.bgColor} ${statusInfo.textColor} py-1 px-2 md:px-2.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap`}
        >
          {statusInfo.label}
        </p>
        <div className="flex flex-col items-end text-xs md:text-sm text-textColor">
          <p className="font-medium">{date}</p>
          <p className="text-gray-600">{amount}</p>
        </div>
      </div>
    </div>
  );
};
