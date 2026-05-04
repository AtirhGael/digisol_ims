import { Input } from "../../components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../Hooks/useAuth";
import { Button } from "@/components/ui/button";

// login interface
interface LoginInterface {
  email: string;
  password: string;
}

export const Login = () => {
  const { login } = useAuth();
  // Base url
  const apiBaseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:4000/api";
  // loading state
  const [Loading, setLoading] = useState(false);
  // form data
  const [LoginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  } as LoginInterface);

  // function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // if the fileds are empty
    if (!LoginDetails.email || !LoginDetails.password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(LoginDetails),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        toast.error(data.message || "Login failed. Please try again.");
        return;
      }
      toast.success("Login successful!");
      const mustChangePassword =
        data?.data?.user?.password_must_change || false;
      const permissions = data?.data?.permissions ?? [];
      const roles = data?.data?.user?.roles ?? [];
      login(
        data?.data?.user,
        data?.data?.token,
        data?.data?.refresh_token,
        mustChangePassword,
        permissions,
        roles,
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* header */}
      <div className="w-full border-b-2 border-gray-200 p-3">
        <img src="/src/Assets/digisolLogo 1.png" alt="logo" />
      </div>
      {/* login secton */}
      <div className="w-full min-h-[95vh] flex items-center justify-center">
        <div className="max-w-350 w-87.5 flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold">Login</h1>
            <p className="mt-2">Hi, Welcome back🙌</p>
          </div>
          {/* login text section */}
          <div className="max-w-87.5 relative border border-gray-200">
            <p className="text-gray-400 absolute bg-white p-2 -top-5 left-[50%] translate-x-[-50%] text-[12px]">
              Login with username
            </p>
          </div>
          {/* login form */}
          <form className="mt-10" onSubmit={handleSubmit}>
            {/* email */}
            <div>
              <label>Email/Username</label>
              <Input
                type="email"
                onChange={(e) =>
                  setLoginDetails({
                    ...LoginDetails,
                    email: e.target.value.trim(),
                  })
                }
                placeholder="Provide email"
                className="mt-2"
                required
              />
            </div>
            {/* password */}
            <div className="mt-2">
              <label>Password</label>
              <Input
                required
                onChange={(e) =>
                  setLoginDetails({
                    ...LoginDetails,
                    password: e.target.value.trim(),
                  })
                }
                type="password"
                placeholder="Enter password"
                className="mt-2"
              />
            </div>
            {/* forgot password */}
            <div className="mt-2 flex justify-end">
              <Link
                to={"/restpassword"}
                className="text-sm text-primary hover:opacity-75 font-normal"
              >
                Forgot password?
              </Link>
            </div>
            {/* button */}
            <Button loading={Loading} className="w-full mt-3 py-6">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
