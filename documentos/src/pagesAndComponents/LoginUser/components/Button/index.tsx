import { PropsWithChildren, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }
export default function Button({ children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button {...props} className="bg-red-600 hover:bg-red-700 text-white text-base rounded-lg p-[0.625rem] transition-colors font-semibold">
      {children}
    </button>
  );
}
