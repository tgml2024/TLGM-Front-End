import {
  ArrowLeftIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  Bars3Icon,
  ChartBarIcon,
  CheckBadgeIcon,
  Cog6ToothIcon,
  HomeIcon,
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
  { name: 'Sanding Group', icon: ArrowRightIcon, path: '/user/sandinggroup' },
  { name: 'Resive Group', icon: ArrowLeftIcon, path: '/user/resivegroup' },
  { name: 'Forward Message', icon: PaperAirplaneIcon, path: '/user/forward' },
];

const UserSidebar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(
    null
  );
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Add useRef for the dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Add click outside handler
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

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 flex items-center px-4">
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

        {/* เพิ��มปุ่มย่อ/ขยาย sidebar สำหรับหน้าจอ desktop */}
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
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                {getInitials(userProfile?.user.name || '')}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-white">
                {userProfile?.user.name || 'Loading...'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-white dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      router.push('/user/settings');
                      setShowProfileDropdown(false);
                    }}
                  >
                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                    Settings
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-white dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      handleLogout();
                      setShowProfileDropdown(false);
                    }}
                  >
                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
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
          bg-white dark:bg-gray-800 text-gray-700 dark:text-white 
          ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col
          border-r border-gray-200 dark:border-gray-700
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
                  flex items-center px-4 py-2 text-sm
                  ${
                    router.pathname === item.path
                      ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                  cursor-pointer transition-colors duration-200
                `}
              >
                <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
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
