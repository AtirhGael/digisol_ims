import { useNavigate } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { Button } from "@/components/ui/button";

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
        <MdLockOutline className="text-red-500 text-4xl" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-800">Access Denied</h1>
        <p className="text-gray-500 max-w-md">
          You don't have permission to view this page. Contact your
          administrator if you believe this is a mistake.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
