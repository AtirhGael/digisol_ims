import React from "react";
import { FaBuildingColumns } from "react-icons/fa6";
import { Link } from "react-router-dom";

interface ClientCardProps {
  id: string;
  clientId: string;
  companyName: string;
  industry: string;
  profileInitial: string;
  contactPersonInitials: string;
  contactPersonName: string;
  contractsCount: number;
  value: string;
  lastContractDate: string;
  status: "Active" | "Inactive";
  statusColor?: string;
}

export const ClientCards: React.FC<ClientCardProps> = ({
  clientId,
  id,
  companyName,
  industry,
  profileInitial,
  contactPersonInitials,
  contactPersonName,
  contractsCount,
  value,
  lastContractDate,
  status,
  statusColor = "bg-green-500",
}) => {
  return (
    <>
      <Link to={`/dashboard/clients/${id}`}>
        <div className="bg-white max-w-[330px] w-[310px] p-3 rounded-lg hover:shadow-md duration-150 cursor-pointer">
          <div className="flex items-center gap-5">
            {/* profile picture */}
            <div
              className={`w-20 h-18 rounded-full flex items-center justify-center bg-primary text-white`}
            >
              <p>{profileInitial?.trim().slice(0, 2) || "??"}</p>
            </div>
            <div>
              {/* FBN */}
              <p className="text-xs text-textColor">{clientId}</p>
              <p>{companyName}</p>
              <div className="flex items-center gap-1 text-sm text-textColor mt-1">
                <FaBuildingColumns />
                <p>{industry}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-2 mt-5 items-center">
              <p className="bg-primary text-white py-1.5 px-2 text-sm rounded-full">
                {contactPersonInitials?.trim().slice(0, 2) || "??"}
              </p>
              <p>{contactPersonName}</p>
            </div>
            <div className="grid grid-cols-2 pt-4 gap-2">
              <div className="bg-gray-200/50 rounded-lg p-3 flex flex-col items-center gap-1">
                <p className="text-xs">Contracts</p>
                <p className="text-textColor">{contractsCount}</p>
              </div>
              <div className="bg-gray-200/50 rounded-lg p-3 flex flex-col items-center gap-1">
                <p className="text-xs">Value</p>
                <p className="text-textColor">{value}</p>
              </div>
            </div>
          </div>
          {/* date and status */}
          <div className="mt-5">
            <p className="text-sm text-textColor">
              Last contract: {lastContractDate}
            </p>
            {(() => {
              const statusLower = (status || "").toLowerCase();
              const isActive = statusLower === "active";
              const isSuspended = statusLower === "suspended";
              const dotClass = isActive ? "bg-green-600" : isSuspended ? "bg-red-600" : "bg-gray-400";
              const textClass = isActive ? "text-green-700" : isSuspended ? "text-red-600" : "text-gray-600";
              return (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 ${dotClass} rounded-full`}></span>
                  <p className={`text-sm ${textClass}`}>{status}</p>
                </div>
              );
            })()}
          </div>
        </div>
      </Link>
    </>
  );
};
