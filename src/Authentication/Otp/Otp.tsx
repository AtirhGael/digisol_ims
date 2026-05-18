import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { cn } from "../../lib/utils";
import {usePost} from "../../Hooks/UsePostHook";
import { useUserStore } from "../../Store/UserStore";
import { toast } from "sonner";

export const Otp = () => {
  const { postData: verifyOtpPost, loading: isVerifying } = usePost();
  const { postData: resendOtpPost, loading: isResending } = usePost();
  const { resetEmail } = useUserStore();
  const navigate = useNavigate();
  // OTP state
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [inputErrors, setInputErrors] = useState<boolean[]>(
    new Array(6).fill(false),
  );
  const [backendError, setBackendError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // OTP handling functions
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    const newOtp = [...otp];
    const newErrors = [...inputErrors];

    if (isNaN(Number(value))) {
      newErrors[index] = true;
    } else {
      newErrors[index] = false;
      newOtp[index] = value;
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setOtp(newOtp);
    setInputErrors(newErrors);
    setBackendError(false); // Reset backend error on new input
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste
      .slice(0, 6)
      .split("")
      .filter((char) => !isNaN(Number(char)));

    if (pasteArray.length > 0) {
      const newOtp = [...otp];
      pasteArray.forEach((value, index) => {
        if (index < 6) {
          newOtp[index] = value;
        }
      });
      setOtp(newOtp);
      setInputErrors(new Array(6).fill(false)); // Reset errors on paste
      setBackendError(false);

      // Focus on the next empty field or the last field
      const nextFocusIndex = Math.min(pasteArray.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };
// function to handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || inputErrors.some((e) => e)) {
      toast.error("Please enter a complete and valid 6-digit OTP");
      return;
    }

    try {
      const response = await verifyOtpPost("/auth/validate-otp", {
        email: resetEmail,
        otp: otpValue,
      });
      if (response) {
        toast.success("OTP verified successfully");
        navigate("/newpassword"); // or wherever you want to redirect
      }
    } catch (error) {
      setBackendError(true);
      toast.error("Invalid OTP");
    }
  };
// function to handle OTP resend with countdown
  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    try {
      const response = await resendOtpPost("/auth/send-otp", {
        email: resetEmail,
      });
      if (response) {
        toast.success("A new OTP has been sent to your email.");
        setCooldown(60); // Start 60-second cooldown
        setOtp(new Array(6).fill("")); // Clear OTP fields
        setBackendError(false); // Clear previous errors
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message);
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
        <Link to={"/restpassword"}>
          <FaArrowLeft className="ml-4 mt-4 text-xl md:text-2xl cursor-pointer text-primary" />
        </Link>
        <div className="w-full flex justify-center mt-12">
          <div className="max-w-350 w-[350px] h-fit over">
            <form className="flex flex-col justify-center w-full">
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-semibold">Enter OTP Code</h1>
                <p className="text-center text-sm mt-3">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
              <div className="max-w-[350px] relative border mt-8 border-gray-200">
                <p className="text-gray-400 absolute bg-white p-2 -top-5 left-[50%] translate-x-[-50%] text-[12px]">
                  Enter OTP
                </p>
              </div>

              {/* OTP input section */}
              <div className="mt-10">
                <div className="flex justify-center gap-2 md:gap-3">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      ref={(el: any) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={data}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e.target, index)
                      }
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(e, index)
                      }
                      onPaste={handlePaste}
                      className={cn(
                        "w-10 h-10 md:w-10 md:h-10 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none transition-colors",
                        inputErrors[index] || backendError
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-primary",
                      )}
                    />
                  ))}
                </div>
              </div>
              {/* button */}
              <Button
                loading={isVerifying}
                className="w-full mt-8 py-6"
                onClick={handleVerifyOTP}
              >
                Verify OTP
              </Button>

              {/* Resend OTP option */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={handleResendOTP}
                    disabled={isResending || cooldown > 0}
                  >
                    {isResending
                      ? "Sending..."
                      : cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : "Resend OTP"}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
