import React from "react";

export type MetaRowProps = {
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const MetaRow: React.FC<MetaRowProps> = ({ icon, className, children }) => (
  <span className={className}>
    {icon}
    {children}
  </span>
);
