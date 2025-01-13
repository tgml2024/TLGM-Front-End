import {
  ArrowLeftIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  ArrowUturnRightIcon,
  Bars3Icon,
  ChartPieIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  Cog6ToothIcon,
  HomeIcon,
  KeyIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import { logout } from '@/services/logoutServices';
import { getUserProfile } from '@/services/profileService';
import { UserProfileResponse } from '@/types/UserType';

interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const navigation: NavItem[] = [
  { name: 'Home', icon: HomeIcon, path: '/user' },
  { name: 'Dashboard', icon: ChartPieIcon, path: '/user/dashboard' },
  { name: 'Confirm Telegram', icon: CheckBadgeIcon, path: '/user/confirm' },
  { name: 'Sender Group', icon: ArrowRightIcon, path: '/user/sandinggroup' },
  { name: 'Target Group', icon: ArrowLeftIcon, path: '/user/resivegroup' },
  { name: 'Forward Message', icon: ArrowUturnRightIcon, path: '/user/forward' },
  { name: 'Send Message', icon: PaperAirplaneIcon, path: '/user/sandmessage' },
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

// เพิ่ม interface
interface IconAnimations {
  [key: string]: string;
}

const UserSidebar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(
    null
  );
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);

  // Add useRef for the dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);

  // เพิ่ม state สำหรับเก็บ animations
  const [iconAnimations, setIconAnimations] = useState<IconAnimations>({});
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        // console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

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

  // ปิด sidebar เมื่อหน้าจอใหญ่ขึ้น
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // สร้างฟังก์ชันสำหรับดึงตัวอักษรแรกของชือ
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Update click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
        setShowSettingsSubmenu(false); // Reset settings submenu when closing dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this function to handle back button click
  const handleBackFromSettings = () => {
    setShowSettingsSubmenu(false);
  };

  // ปรับฟังก์ชัน useEffect สำหรับ animations
  useEffect(() => {
    if (hoveredItem) {
      const updateAnimation = () => {
        setIconAnimations((prev) => ({
          ...prev,
          [hoveredItem]: getRandomAnimation(),
        }));
      };

      updateAnimation();
      const interval = setInterval(updateAnimation, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [hoveredItem]);

  return (
    <>
      {/* Top Navigation Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-16 
        bg-[#0A0A0A]
        background: #0A0A0A;  /* Fallback color */
        background: -webkit-linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
        background: -moz-linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
        background: -o-linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
        background: linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
        border-b border-[#D4AF37]/20 z-40 flex items-center px-4"
      >
        {/* Mobile Toggle */}
        <button
          className="sm:hidden p-2 rounded-lg 
            text-gray-300 hover:text-[#B38B59]
            hover:bg-[#1a1a1a] transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {/* เพิ่มปุ่มย่อ/ขยาย sidebar สำหรับหน้าจอ desktop */}
        <button
          className="hidden sm:flex p-2 rounded-lg 
            text-gray-300 hover:text-[#B38B59]
            hover:bg-[#1a1a1a] transition-all duration-300"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo Container with Premium Gold Effect */}
        <div
          className="relative h-8 ml-6 sm:ml-4
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
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 
            bg-gradient-to-r from-[#D4AF37]/20 via-[#FFFFFF]/30 to-[#D4AF37]/20
            animate-shimmer"
          />

          {/* Shine effect on hover */}
          <div
            className="absolute inset-0 
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            -translate-x-[200%] group-hover:translate-x-[200%]
            transition-transform duration-1000 ease-in-out"
          />

          {/* Inner glow */}
          <div
            className="absolute inset-0 
            bg-gradient-to-r from-[#D4AF37]/0 via-[#FFFFFF]/10 to-[#D4AF37]/0
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300"
          />

          {/* Logo image */}
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-8 w-auto relative z-10
              mix-blend-multiply dark:mix-blend-normal
              transition-all duration-300
              group-hover:brightness-110"
          />
        </div>

        {/* Updated Right Side Items with Dropdown */}
        <div className="ml-auto flex items-center gap-4 absolute right-5">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 p-2 rounded-lg 
                relative overflow-hidden group
                text-gray-200
                transition-all duration-300
                hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              onClick={() => {
                if (showProfileDropdown) {
                  setShowProfileDropdown(false);
                  setShowSettingsSubmenu(false);
                } else {
                  setShowProfileDropdown(true);
                }
              }}
            >
              {/* Hover background gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                transition-opacity duration-300 ease-in-out"
              />

              {/* Content */}
              <div className="relative flex items-center gap-2 group-hover:text-[#D4AF37]">
                <div
                  className="w-8 h-8 rounded-full 
                  bg-gradient-to-br from-[#D4AF37] to-[#8B6B43] 
                  flex items-center justify-center 
                  text-sm font-bold text-white
                  shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                >
                  {getInitials(userProfile?.user.name || '')}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {userProfile?.user.name || 'Loading...'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-3 w-64 
                bg-gradient-to-b from-[#111111] to-[#0A0A0A] 
                rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.3)] 
                border border-[#D4AF37]/20 overflow-hidden"
              >
                {!showSettingsSubmenu ? (
                  // Main Menu
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#050C9C] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {getInitials(userProfile?.user.name || '')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {userProfile?.user.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-[#B38B59] transition-all duration-150"
                      onClick={() => setShowSettingsSubmenu(true)}
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-3 text-[#B38B59]" />
                      <span>Settings</span>
                    </button>

                    <button
                      className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition-colors duration-150"
                      onClick={() => {
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                    >
                      <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  // Settings Submenu
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <button
                        className="flex items-center text-sm text-gray-300 hover:text-[#B38B59] transition-colors duration-300"
                        onClick={handleBackFromSettings}
                      >
                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        className="w-full flex items-center px-4 py-3 text-sm 
                          relative overflow-hidden group
                          text-gray-200
                          transition-all duration-300"
                        onClick={() => {
                          router.push('/user/settings');
                          setShowProfileDropdown(false);
                        }}
                      >
                        {/* Hover background gradient */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100
                          bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                          transition-opacity duration-300 ease-in-out"
                        />
                        <div className="relative flex items-center w-full group-hover:text-[#D4AF37]">
                          <div
                            className="w-8 h-8 rounded-full 
                            bg-gradient-to-br from-[#111111] to-black 
                            flex items-center justify-center mr-3 
                            border border-[#D4AF37]/20
                            group-hover:border-[#D4AF37]/40
                            transition-all duration-300"
                          >
                            <Cog6ToothIcon className="w-4 h-4 text-[#D4AF37]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium group-hover:text-[#D4AF37]">
                              Profile Settings
                            </p>
                            <p className="text-xs text-gray-400 group-hover:text-[#C5A572]">
                              Manage your account details
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        className="w-full flex items-center px-4 py-3 text-sm 
                          relative overflow-hidden group
                          text-gray-200
                          transition-all duration-300"
                        onClick={() => {
                          router.push('/user/changepassword');
                          setShowProfileDropdown(false);
                        }}
                      >
                        {/* Hover background gradient */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100
                          bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                          transition-opacity duration-300 ease-in-out"
                        />
                        <div className="relative flex items-center w-full">
                          <div
                            className="w-8 h-8 rounded-full 
                            bg-gradient-to-br from-[#111111] to-black 
                            flex items-center justify-center mr-3 
                            border border-[#D4AF37]/20
                            group-hover:border-[#D4AF37]/40
                            transition-all duration-300"
                          >
                            <KeyIcon className="w-4 h-4 text-[#D4AF37]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium group-hover:text-[#D4AF37]">
                              Change Password
                            </p>
                            <p className="text-xs text-gray-400 group-hover:text-[#C5A572]">
                              Update your password
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sidebar - ปรับ width ตาม state isCollapsed */}
      <div
        className={`
          fixed sm:static inset-y-0 left-0 z-30
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 transition-all duration-300 ease-in-out
          bg-[#0A0A0A]
          background: #0A0A0A;  /* Fallback color */
          background: -webkit-linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
          background: -moz-linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
          background: -o-linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
          background: linear-gradient(to right, #0A0A0A, #111111, #0A0A0A);
          text-gray-200
          ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col
          border-r border-[#D4AF37]/20
          mt-16 bottom-0
        `}
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
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setIconAnimations((prev) => ({
                    ...prev,
                    [item.name]: '', // ล้าง animation เมื่อ mouse leave
                  }));
                }}
                className={`
                  flex items-center px-4 py-2 text-sm group
                  relative overflow-hidden
                  ${
                    router.pathname === item.path
                      ? 'bg-[#1A1A1A] text-[#D4AF37] border-l-4 border-[#D4AF37]'
                      : 'text-gray-200 hover:text-[#D4AF37]'
                  }
                  cursor-pointer transition-all duration-200
                  hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]
                `}
              >
                {/* Hover background gradient */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100
                  bg-gradient-to-r from-[#D4AF37]/10 via-[#B38B59]/20 to-[#8B6B43]/10
                  transition-opacity duration-300 ease-in-out
                  ${router.pathname === item.path ? 'opacity-100' : ''}
                `}
                />

                {/* Icon */}
                <item.icon
                  className={`
                    w-5 h-5 mr-3
                    ${
                      hoveredItem === item.name
                        ? `animate__animated ${iconAnimations[item.name]}`
                        : ''
                    }
                    ${
                      hoveredItem === item.name
                        ? 'animate__infinite animate__slower'
                        : ''
                    }
                    group-hover:text-[#D4AF37]
                    ${
                      router.pathname === item.path
                        ? 'text-[#D4AF37]'
                        : 'text-[#C5A572]'
                    }
                  `}
                  aria-hidden="true"
                />

                <span className="relative z-10">
                  {!isCollapsed && item.name}
                </span>
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

export default UserSidebar;
