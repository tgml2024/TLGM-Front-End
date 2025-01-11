import {
  ArrowLeftIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  ArrowUturnRightIcon,
  Bars3Icon,
  ChartBarIcon,
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
  { name: 'Dashboard', icon: ChartBarIcon, path: '/user/dashboard' },
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

  // เพิ่ม useEffect พื่อสุ่ม animations ใหม่ทุกๆ 3 วินาที
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

    updateAnimations(); // สุ่มครั้งแรก
    const interval = setInterval(updateAnimations, 3000); // สุ่มทุก 3 วินาที

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#050C9C] via-[#050C9C] to-[#3572EF] dark:from-[#050C9C] dark:via-[#050C9C] dark:to-[#3572EF] border-b border-[#3572EF]/20 z-40 flex items-center px-4">
        {/* Mobile Toggle */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-white" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-white" />
          )}
        </button>

        {/* เพิ่มปุ่มย่อ/ขยาย sidebar สำหรับหน้าจอ desktop */}
        <button
          className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Bars3Icon className="w-6 h-6 text-white" />
        </button>

        {/* Logo */}
        <img src="/images/logo.png" alt="Logo" className="h-8 ml-2 sm:ml-0" />

        {/* Updated Right Side Items with Dropdown */}
        <div className="ml-auto flex items-center gap-4 absolute right-5">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                if (showProfileDropdown) {
                  setShowProfileDropdown(false);
                  setShowSettingsSubmenu(false); // Reset settings submenu when closing dropdown
                } else {
                  setShowProfileDropdown(true);
                }
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#050C9C] flex items-center justify-center text-sm font-bold text-white">
                {getInitials(userProfile?.user.name || '')}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-white">
                {userProfile?.user.name || 'Loading...'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-gradient-to-b from-[#1a1a1a] to-[#000000] rounded-lg shadow-lg border border-gray-800 overflow-hidden">
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
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-150"
                      onClick={() => setShowSettingsSubmenu(true)}
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
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
                        className="flex items-center text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                        onClick={handleBackFromSettings}
                      >
                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => {
                          router.push('/user/settings');
                          setShowProfileDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#A7E6FF] dark:bg-[#050C9C]/30 flex items-center justify-center mr-3">
                            <Cog6ToothIcon className="w-4 h-4 text-[#050C9C] dark:text-[#3ABEF9]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Profile Settings</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Manage your account details
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => {
                          router.push('/user/change-password');
                          setShowProfileDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#A7E6FF] dark:bg-[#050C9C]/30 flex items-center justify-center mr-3">
                            <KeyIcon className="w-4 h-4 text-[#050C9C] dark:text-[#3ABEF9]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Change Password</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
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
          bg-gradient-to-b from-[#050C9C] via-[#3572EF]/90 to-[#050C9C]
          dark:from-[#050C9C] dark:via-[#050C9C] dark:to-[#050C9C]
          text-gray-700 dark:text-white 
          ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col
          border-r border-[#3572EF]/20
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
                className={`
                  flex items-center px-4 py-2 text-sm group
                  ${
                    router.pathname === item.path
                      ? 'bg-[#A7E6FF]/20 dark:bg-[#050C9C]/20 text-[#050C9C] dark:text-[#3ABEF9] border-l-4 border-[#3572EF]'
                      : 'hover:bg-[#A7E6FF]/10 dark:hover:bg-[#050C9C]/10'
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
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-6">
                <ArrowLeftStartOnRectangleIcon className="mx-auto h-16 w-16 text-red-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to logout?
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 
                  rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600
                  rounded-2xl transition-all duration-200 font-medium"
                  onClick={confirmLogout}
                >
                  Confirm
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
