import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

export const NewPassword = () => {
  // loading state
  const [Loading, setLoading] = useState(false);
  return (
    <div className="w-full min-h-screen">
      {/* header */}
      <div className="w-full border-b-2 border-gray-200 p-3">
        <img src="/src/Assets/digisolLogo 1.png" alt="logo" />
      </div>
      {/* reset password secton */}
      <div className="pt-4 w-full min-h-[95vh]">
        <Link to={"/otp"}>
          <FaArrowLeft className="ml-4 mt-4 text-xl md:text-2xl cursor-pointer text-primary" />
        </Link>
        <div className="w-full flex justify-center mt-12">
          <div className="max-w-350 w-[350px] h-fit">
            <form className="flex flex-col justify-center w-full">
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-semibold">Enter new paswword</h1>
                <p className="text-center text-sm mt-3">
                  Provide your new password below to rest your account password
                </p>
              </div>
              <div className="max-w-[350px] relative border mt-8 border-gray-200">
                <p className="text-gray-400 absolute bg-white p-2 -top-5 left-[50%] translate-x-[-50%] text-[12px]">
                  New Password
                </p>
              </div>

              {/* new password section */}
              <div className="mt-10">
                <label>New Password</label>
                <Input
                  type="text"
                  placeholder="Provide new password"
                  className="mt-2"
                  required
                />
              </div>
              {/* button */}
              <Button loading={Loading} className="w-full mt-5 py-6">
                Save Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
