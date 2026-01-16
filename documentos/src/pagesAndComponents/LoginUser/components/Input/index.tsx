interface InputProps {
    type: string
    placeholder: string
}

export default function Input({type, placeholder}:InputProps) {
  return (
    <input
      className="p-2 px-4 rounded-md w-full outline-none border border-gray-400"
      type={type}
      placeholder={placeholder}
    />
  );
}
