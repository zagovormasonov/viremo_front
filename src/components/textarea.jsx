import React from "react";

export const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`border border-gray-300 rounded px-3 py-2 w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      rows={4}
      {...props}
    />
  );
};
