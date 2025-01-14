import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { getAdminProfiles } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const AdminMainPage: React.FC = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getAdminProfiles,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate__animated animate__fadeIn">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white">
      <div className="h-[70vh]  flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="relative space-y-4">
            <h1 className="text-[6vw] font-bold tracking-tight animate__animated animate__fadeInUp leading-none">
              <span
                className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] 
                bg-clip-text text-transparent relative inline-block 
                transform hover:scale-105 transition-transform duration-300"
              >
                Admin Panel
              </span>
            </h1>

            <h2 className="text-[4vw] font-bold animate__animated animate__fadeInUp animate__delay-1s">
              <span
                className="bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] 
                bg-clip-text text-transparent relative inline-block hover:animate-pulse"
              >
                {profileData?.user.name || 'Admin'}
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 w-16 h-16 border-l border-t border-gray-200 animate__animated animate__fadeIn animate__delay-2s"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r border-b border-gray-200 animate__animated animate__fadeIn animate__delay-2s"></div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-500 rounded-full animate-ping opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-ping delay-300 opacity-70"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-ping delay-700 opacity-70"></div>
      </div>
    </div>
  );
};

export default withAuth(AdminMainPage, 'admin');
