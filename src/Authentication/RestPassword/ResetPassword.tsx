import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import {usePost} from "../../Hooks/UsePostHook";
import { toast } from "sonner";
import { useUserStore } from "../../Store/UserStore";

export const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const { postData, loading, error } = usePost();
  const navigate = useNavigate();
  const { setResetEmail } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await postData("/auth/send-otp", { email });
      if (response) {
        setResetEmail(email);
        toast.success("OTP sent successfully");
        navigate("/otp");
      }
    } catch (err: any) {
      toast.error(err?.message);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* header */}
      <div className="w-full border-b-2 border-gray-200 p-3">
        <img src="/digisolLogo.png" alt="logo" />
      </div>
      {/* reset password secton */}
      <div className="pt-4 w-full min-h-[95vh]">
        <Link to={"/"}>
          <FaArrowLeft className="ml-4 mt-4 text-xl md:text-2xl cursor-pointer text-primary" />
        </Link>
        <div className="w-full flex justify-center mt-12">
          <div className="max-w-350 w-[350px] h-fit">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col justify-center w-full"
            >
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-semibold">
                  Forgot your password?
                </h1>
                <p className="text-center text-sm mt-3">
                  A code will be sent to the email that will be provided below
                </p>
              </div>
              <div className="max-w-[350px] relative border mt-8 border-gray-200">
                <p className="text-gray-400 absolute bg-white p-2 -top-5 left-[50%] translate-x-[-50%] text-[12px]">
                  Provide Email
                </p>
              </div>

              {/* email section */}
              <div className="mt-10">
                <label>Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error}
                  placeholder="Provide email"
                  className="mt-2"
                  required
                />
              </div>
              {/* button */}
              <Button loading={loading} className="w-full mt-5 py-6">
                Reset Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
