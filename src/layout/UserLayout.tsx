import dynamic from 'next/dynamic';
import React from 'react';

const UserSidebar = dynamic(() => import('../components/sidebar/UserSidebar'), {
  ssr: false,
});

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 mt-16 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default UserLayout;
