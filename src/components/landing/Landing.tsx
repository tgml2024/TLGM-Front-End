import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

type LandingPageProps = {};

const LandingPage: React.FC<LandingPageProps> = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <div className="relative w-56 h-56">
        <Image
          src="/images/logo.png"
          alt="Logo"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 14rem"
          className="object-contain"
        />
      </div>
      <div className="flex items-center space-x-2">
        <svg className="animate-spin h-8 w-8 text-gray-700" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-gray-700 text-lg">Loading...</span>
      </div>
    </div>
  );
};

export default LandingPage;
