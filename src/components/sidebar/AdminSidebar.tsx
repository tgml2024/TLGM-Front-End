import 'animate.css';

import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import { logout } from '@/services/logoutServices';
import { getAdminProfiles } from '@/services/profileService';
import { AdminProfileResponse } from '@/types/AdminType';

interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const navigation: NavItem[] = [
  { name: 'Home', icon: HomeIcon, path: '/admin' },
  {
    name: 'Dashboard Range',
    icon: ChartBarIcon,
    path: '/admin/dashboardrange',
  },
  { name: 'Manage Users', icon: UserGroupIcon, path: '/admin/manageusers' },
  // { name: 'Add User', icon: UserPlusIcon, path: '/admin/adduser' },
];

const animations = [
  'animate__tada',
  'animate__headShake',
  'animate__rubberBand',
];

const getRandomAnimation = () => {
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
};

interface IconAnimations {
  [key: string]: string;
}

const AdminSidebar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfileResponse | null>(
    null
  );
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [iconAnimations, setIconAnimations] = useState<IconAnimations>({});

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    const response = await logout();
    if (response.success) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await getAdminProfiles();
        setAdminProfile(profile);
      } catch (error) {
        // console.error('Failed to fetch user profile:', error);
      }
    };
    fetchAdminProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateAnimations = () => {
      const newAnimations = navigation.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: getRandomAnimation(),
        }),
        {}
      );
      setIconAnimations(newAnimations);
    };

    updateAnimations();
    const interval = setInterval(updateAnimations, 3000);

    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-16 
        bg-gradient-to-r from-[#0A0A0A] via-[#111111] to-[#0A0A0A]
        border-b border-[#D4AF37]/20 z-40 flex items-center px-4"
      >
        {/* Menu Toggle Button */}
        <button
          className="sm:hidden p-2 rounded-lg 
          text-gray-200 hover:text-[#D4AF37]
          hover:bg-[#1A1A1A] transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {/* Sidebar Toggle Button */}
        <button
          className="hidden sm:flex p-2 rounded-lg 
          text-gray-200 hover:text-[#D4AF37]
          hover:bg-[#1A1A1A] transition-all duration-300 ml-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div
          className="relative h-8 ml-4 sm:ml-2 
          bg-gradient-to-r from-[#D4AF37] via-[#C5A572] to-[#8B6B43]
          rounded-lg overflow-hidden
          shadow-[0_0_15px_rgba(212,175,55,0.3)]
          border border-[#D4AF37]/30
          group
          hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]
          hover:border-[#D4AF37]/50
          transition-all duration-500 ease-in-out
          transform hover:scale-105"
        >
          <div
            className="absolute inset-0 
            bg-gradient-to-r from-[#D4AF37]/20 via-[#FFFFFF]/30 to-[#D4AF37]/20
            animate-shimmer"
          />
          <div
            className="absolute inset-0 
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            -translate-x-[200%] group-hover:translate-x-[200%]
            transition-transform duration-1000 ease-in-out"
          />
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-8 w-auto relative z-10
              mix-blend-multiply dark:mix-blend-normal
              transition-all duration-300
              group-hover:brightness-110"
          />
        </div>

        {/* Profile Button */}
        <div className="ml-auto flex items-center gap-4 absolute right-5">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 p-2 rounded-lg 
              relative overflow-hidden group
              text-gray-200 transition-all duration-300"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                transition-opacity duration-300 ease-in-out"
              />
              <div
                className="w-8 h-8 rounded-full 
                bg-gradient-to-br from-[#D4AF37] to-[#8B6B43] 
                flex items-center justify-center text-sm font-bold text-white"
              >
                {getInitials(adminProfile?.user.name || '')}
              </div>
              <span className="hidden sm:inline text-sm font-medium group-hover:text-[#D4AF37]">
                {adminProfile?.user.name || 'Loading...'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-3 w-48 
                bg-gradient-to-b from-[#111111] to-[#0A0A0A]
                rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.3)]
                border border-[#D4AF37]/20"
              >
                <div className="py-1">
                  <button
                    className="w-full flex items-center px-4 py-2 
                    text-sm text-gray-200 
                    relative overflow-hidden group
                    transition-all duration-300"
                    onClick={() => {
                      router.push('/admin/settings');
                      setShowProfileDropdown(false);
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100
                      bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                      transition-opacity duration-300 ease-in-out"
                    />
                    <Cog6ToothIcon className="w-5 h-5 mr-2 text-[#C5A572] group-hover:text-[#D4AF37]" />
                    <span className="relative z-10 group-hover:text-[#D4AF37]">
                      Settings
                    </span>
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 
                    text-sm text-gray-200
                    relative overflow-hidden group
                    transition-all duration-300"
                    onClick={() => {
                      handleLogout();
                      setShowProfileDropdown(false);
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100
                      bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10
                      transition-opacity duration-300 ease-in-out"
                    />
                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-2 text-red-400 group-hover:text-red-500" />
                    <span className="relative z-10 text-red-400 group-hover:text-red-500">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sidebar */}
      <div
        className={`
        fixed sm:static inset-y-0 left-0 z-30
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0 transition-all duration-300 ease-in-out
        bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A]
        text-gray-200 
        ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col
        border-r border-[#D4AF37]/20
        mt-16 bottom-0`}
      >
        <nav className="h-[calc(100vh-4rem)] flex-1 py-4">
          <div className="h-full overflow-hidden">
            {navigation.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(item.path);
                }}
                className={`
                  flex items-center px-4 py-2 text-sm
                  ${
                    router.pathname === item.path
                      ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                  cursor-pointer transition-colors duration-200
                `}
              >
                <item.icon
                  className={`
                    w-5 h-5 mr-3 animate__animated ${
                      iconAnimations[item.name]
                    } animate__infinite animate__slower
                    group-hover:animate__headShake
                  `}
                  aria-hidden="true"
                />
                {!isCollapsed && item.name}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowLogoutModal(false)}
          />
          <div
            className="relative bg-gradient-to-b from-[#111111] to-[#0A0A0A] 
            w-full max-w-md rounded-3xl 
            shadow-[0_0_30px_rgba(212,175,55,0.3)] 
            border border-[#D4AF37]/20"
          >
            <div className="p-8">
              {/* Icon */}
              <div
                className="mx-auto w-16 h-16 rounded-full 
                bg-gradient-to-br from-[#D4AF37] to-[#8B6B43] 
                flex items-center justify-center
                shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <ArrowLeftStartOnRectangleIcon className="h-8 w-8 text-white" />
              </div>

              {/* Text Content */}
              <div className="text-center mt-6 mb-8">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-300">
                  Are you sure you want to logout?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  className="flex-1 px-4 py-2.5 text-sm 
                  relative overflow-hidden group
                  bg-[#1A1A1A] rounded-2xl
                  border border-[#D4AF37]/30
                  hover:border-[#D4AF37]/50
                  transition-all duration-300"
                  onClick={() => setShowLogoutModal(false)}
                >
                  {/* Hover gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100
                    bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                    transition-opacity duration-300 ease-in-out"
                  />
                  <span className="relative text-[#B38B59] group-hover:text-[#D4AF37]">
                    Cancel
                  </span>
                </button>

                <button
                  className="flex-1 px-4 py-2.5 text-sm 
                  relative overflow-hidden group
                  rounded-2xl text-white
                  bg-gradient-to-r from-[#D4AF37] via-[#C5A572] to-[#8B6B43]
                  shadow-[0_0_15px_rgba(212,175,55,0.3)]
                  hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]
                  transition-all duration-300
                  transform hover:scale-105"
                  onClick={confirmLogout}
                >
                  {/* Shine effect */}
                  <div
                    className="absolute inset-0 
                    bg-gradient-to-r from-transparent via-white/30 to-transparent
                    -translate-x-[200%] group-hover:translate-x-[200%]
                    transition-transform duration-1000 ease-in-out"
                  />
                  <span className="relative">Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
