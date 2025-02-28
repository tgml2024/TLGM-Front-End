import React from 'react';

import Navbar from '@/components/navbar/navbar';

type HomeLayoutProps = {
  children: React.ReactNode;
};

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      {/* <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} TLGM Message. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div>
  );
};

export default HomeLayout;
