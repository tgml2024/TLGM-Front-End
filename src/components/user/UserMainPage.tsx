import 'animate.css';

import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { getUserProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const UserMainPage = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
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
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Welcome Text Container */}
        <div className="relative space-y-4">
          {/* Subtle Welcome Text */}
          <p className="text-lg text-gray-500 tracking-[0.5em] font-light animate__animated animate__fadeIn animate__delay-1s uppercase">
            Welcome Back
          </p>

          {/* Main Greeting */}
          <h1 className="text-[8vw] font-bold tracking-tight animate__animated animate__fadeInUp leading-none">
            <span
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent
                           relative inline-block transform hover:scale-105 transition-transform duration-300"
            >
              สวัสดี
            </span>
          </h1>

          {/* User Name */}
          <h2 className="text-[5vw] font-bold animate__animated animate__fadeInUp animate__delay-1s">
            <span
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent
                           relative inline-block hover:animate-pulse"
            >
              {profileData?.user.name || 'ผู้ใช้งาน'}
            </span>
          </h2>

          {/* Decorative Lines */}
          <div className="flex justify-center gap-4 animate__animated animate__fadeIn animate__delay-2s py-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Minimal Corner Decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l border-t border-gray-200 animate__animated animate__fadeIn animate__delay-2s"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r border-b border-gray-200 animate__animated animate__fadeIn animate__delay-2s"></div>

      {/* Subtle Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-500 rounded-full animate-ping opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-ping delay-300 opacity-70"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-ping delay-700 opacity-70"></div>
      </div>
    </div>
  );
};

export default withAuth(UserMainPage, 'user');
