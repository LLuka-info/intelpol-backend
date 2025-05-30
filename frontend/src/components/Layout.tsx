
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div>
      {/* Aici poți adăuga header, navbar, footer etc. */}
      {children}
    </div>
  );
};

export default Layout;
