import React from "react";
import { CiWarning } from "react-icons/ci";

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="w-full border border-red-500 bg-red-100/50 p-3 rounded-md flex gap-2 items-center text-red-500 text-md">
      <CiWarning className="text-2xl" />
      {message}
    </div>
  );
};

export default ErrorMessage;
