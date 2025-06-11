import React from "react";

const Divider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`w-full flex items-center my-6 ${className}`}>
    <hr className="flex-grow border-t border-neutral-200 dark:border-neutral-700" />
  </div>
);

export default Divider;