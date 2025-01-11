import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { getUserProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const UserMainPage = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  const [showTutorial, setShowTutorial] = useState(false);

  const tutorials = {
    th: 'https://www.youtube.com/watch?v=ez-ZmRwKXBo',
    en: 'https://www.youtube.com/watch?v=2XWUMhJ28Cc',
    cn: 'https://www.youtube.com/watch?v=Re8JSpZIgtc',
  };

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
    <>
      <div className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Welcome Text Container */}
          <div className="relative space-y-4">
            {/* Main Greeting */}
            <h1 className="text-[8vw] font-bold tracking-tight animate__animated animate__fadeInUp leading-none">
              <span
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent
                             relative inline-block transform hover:scale-105 transition-transform duration-300"
              >
                Welcome
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

            {/* Tutorial Button */}
            <button
              className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
                         text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300
                         animate__animated animate__fadeInUp animate__delay-1s"
              onClick={() => setShowTutorial(true)}
            >
              How To Use
            </button>
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

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate__animated animate__fadeIn">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Tutorial Video</h3>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(tutorials).map(([lang, url]) => (
                <div
                  key={lang}
                  className="border rounded-lg p-3 hover:bg-gray-50"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-blue-600 hover:text-blue-800"
                  >
                    <span>
                      {lang === 'th' && 'ภาษาไทย'}
                      {lang === 'en' && 'English'}
                      {lang === 'cn' && '中文'}
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default withAuth(UserMainPage, 'user');
