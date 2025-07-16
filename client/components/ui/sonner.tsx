import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdErrorOutline } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      toastOptions={{
        duration: 1800,
        unstyled: true,
        classNames: {
          toast: `
            animate-fade transition-opacity
            flex items-center gap-2 px-4 py-2 rounded-md 
            !bg-white !text-gray-800 !shadow-md
          `,
          description: "!text-sm !text-gray-700",
        },
      }}
      icons={{
        success: <MdOutlineCheckCircle className="text-green-500 w-5 h-5" />,
        error: <MdErrorOutline className="text-red-500 w-5 h-5" />,
        warning: <IoWarningOutline className="text-yellow-500 w-5 h-5" />,
        info: <Info className="text-blue-500 w-5 h-5" />,
        loading: <Loader2 className="animate-spin text-gray-500 w-5 h-5" />,
        close: <X className="text-gray-400 hover:text-gray-600 w-4 h-4" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
