import {
  Cog6ToothIcon,
  HashtagIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';

import { getUserProfile, updateProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

type UserSettingsProps = {};

const UserSettings: React.FC<UserSettingsProps> = () => {
  const [formData, setFormData] = useState({
    name: '',
    api_id: '',
    api_hash: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getUserProfile();
      setFormData({
        name: response.user?.name || '',
        api_id: response.user?.api_id ? String(response.user.api_id) : '',
        api_hash: response.user?.api_hash ? String(response.user.api_hash) : '',
        phone: response.user?.phone || '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      phone: value || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateProfile(formData);
      toast.success('อัพเดทข้อมูลสำเร็จ');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate__animated animate__fadeIn">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 animate__animated animate__pulse animate__infinite">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 animate__animated animate__fadeInDown">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Profile Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate__animated animate__fadeInUp animate__delay-300ms">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your account details and settings
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      Phone Number
                    </div>
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="TH"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* API Credentials */}
              <div className="mt-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  API Credentials
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="api_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <KeyIcon className="w-5 h-5 text-gray-400" />
                        API ID
                      </div>
                    </label>
                    <input
                      type="text"
                      id="api_id"
                      name="api_id"
                      value={formData.api_id}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your API ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="api_hash"
                      className="block text-sm font-medium text-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HashtagIcon className="w-5 h-5 text-gray-400" />
                        API Hash
                      </div>
                    </label>
                    <input
                      type="text"
                      id="api_hash"
                      name="api_hash"
                      value={formData.api_hash}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your API Hash"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">
                    Get Your Telegram API Credentials
                  </span>
                </div>
                <a
                  href="https://my.telegram.org/auth"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200 text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  rel="noreferrer"
                >
                  <span>Visit Telegram API Development Tools</span>
                  <svg
                    className="w-4 h-4"
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 animate__animated animate__fadeInUp animate__delay-500ms">
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors duration-200"
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-6 py-2.5 rounded-lg transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                font-medium flex items-center gap-2 shadow-sm
                ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
                text-white
              `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                'บันทึกการเปลี่ยนแปลง'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(UserSettings, 'user');
