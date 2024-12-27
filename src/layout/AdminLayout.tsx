import dynamic from 'next/dynamic';
import React from 'react';

const AdminSidebar = dynamic(
  () => import('../components/sidebar/AdminSidebar'),
  {
    ssr: false,
  }
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 mt-16 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
