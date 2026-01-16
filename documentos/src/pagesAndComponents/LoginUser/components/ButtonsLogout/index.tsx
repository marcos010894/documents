import { FaGoogle, FaLinkedin } from "react-icons/fa";

export default function ButtonsLogaut() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 flex items-center gap-2 justify-center p-2 cursor-pointer border border-t-2 border-gray-300 rounded-md">
        <FaGoogle />
        <span>Google</span>
      </div>
      <div className="flex-1 flex items-center gap-2 justify-center p-2 cursor-pointer border border-t-2 border-gray-300 rounded-md">
        <FaLinkedin />
        <span>Linkedin</span>
      </div>
    </div>
  );
}
