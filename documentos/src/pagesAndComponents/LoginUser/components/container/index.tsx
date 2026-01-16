import { PropsWithChildren } from "react";

export default function Container({children}: PropsWithChildren) {
  return (
    <div className="max-w-6xl mx-auto px-5">
      {children}
    </div>
  )
}
