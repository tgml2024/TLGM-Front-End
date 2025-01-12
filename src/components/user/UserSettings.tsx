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

  const handleCancel = () => {
    fetchUserProfile();
    toast.success('รีเซ็ตข้อมูลสำเร็จ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate__animated animate__fadeIn">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto 
            shadow-[0_0_15px_rgba(255,215,0,0.3)]"
          ></div>
          <p
            className="mt-4 text-[#D4AF37] animate__animated animate__pulse animate__infinite
            font-medium tracking-wider"
          >
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Top Navigation Bar */}
      <div
        className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] px-4 py-6 
        shadow-[0_4px_15px_rgba(0,0,0,0.1)] animate__animated animate__fadeInDown"
      >
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/40 rounded-lg">
              <Cog6ToothIcon className="w-8 h-8 text-[#FFD700] transform hover:rotate-90 transition-transform duration-500" />
            </div>
            <h1
              className="text-2xl font-semibold bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] 
              text-transparent bg-clip-text tracking-wide"
            >
              Profile Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div
            className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl 
            shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#FFD700]/20 
            backdrop-blur-sm overflow-hidden animate__animated animate__fadeInUp animate__delay-300ms
            hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)] transition-shadow duration-500"
          >
            <div className="border-b border-[#FFD700]/20 bg-black/40 px-8 py-6">
              <h3
                className="text-xl font-semibold text-[#D4AF37] tracking-wide
                flex items-center gap-2"
              >
                <UserCircleIcon className="w-6 h-6 text-[#FFD700]" />
                Personal Information
              </h3>
              <p className="mt-2 text-sm text-[#8B6B43]">
                Update your account details and settings
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Name Field */}
                <div className="space-y-2 group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#D4AF37]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <UserCircleIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                    text-[#FFD700] placeholder-[#8B6B43]
                    focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                    transition-all duration-300 hover:border-[#FFD700]/50
                    shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                    hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2 group">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#D4AF37]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <PhoneIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                      Phone Number
                    </div>
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="TH"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                    text-[#FFD700] placeholder-[#8B6B43]
                    focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                    transition-all duration-300 hover:border-[#FFD700]/50
                    shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                    hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                  />
                </div>
              </div>

              {/* API Credentials */}
              <div className="mt-12">
                <h4 className="text-lg font-semibold text-[#D4AF37] mb-6 flex items-center gap-2">
                  <KeyIcon className="w-5 h-5 text-[#FFD700]" />
                  API Credentials
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2 group">
                    <label
                      htmlFor="api_id"
                      className="block text-sm font-medium text-[#D4AF37]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <HashtagIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                        API ID
                      </div>
                    </label>
                    <input
                      type="text"
                      id="api_id"
                      name="api_id"
                      value={formData.api_id}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                      text-[#FFD700] placeholder-[#8B6B43]
                      focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                      transition-all duration-300 hover:border-[#FFD700]/50
                      shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                      hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                      placeholder="Enter your API ID"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label
                      htmlFor="api_hash"
                      className="block text-sm font-medium text-[#D4AF37]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <KeyIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                        API Hash
                      </div>
                    </label>
                    <input
                      type="text"
                      id="api_hash"
                      name="api_hash"
                      value={formData.api_hash}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                      text-[#FFD700] placeholder-[#8B6B43]
                      focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                      transition-all duration-300 hover:border-[#FFD700]/50
                      shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                      hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                      placeholder="Enter your API Hash"
                    />
                  </div>
                </div>
              </div>

              <div
                className="mt-8 p-6 bg-black/40 rounded-xl border border-[#FFD700]/20
                backdrop-blur-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.1)] transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-[#FFD700]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z" />
                  </svg>
                  <span className="text-base font-semibold text-[#D4AF37]">
                    Get Your Telegram API Credentials
                  </span>
                </div>
                <a
                  href="https://my.telegram.org/auth"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] rounded-xl 
                  border-2 border-[#FFD700]/30 text-sm font-medium text-[#FFD700] 
                  hover:bg-[#1A1A1A] hover:border-[#FFD700]/50 
                  transition-all duration-300 hover:shadow-[0_4px_15px_rgba(212,175,55,0.15)]
                  transform hover:translate-y-[-2px]"
                  rel="noreferrer"
                >
                  <span>Visit Telegram API Development Tools</span>
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
            </div>

            {/* Move buttons inside the form box */}
            <div className="px-8 py-6 bg-black/40 border-t border-[#FFD700]/20">
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  className="px-8 py-3 text-sm font-medium text-[#8B6B43] hover:text-[#D4AF37] 
                  transition-colors duration-300 rounded-xl hover:bg-black/40"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    px-8 py-3 rounded-xl transition-all duration-300 
                    focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 
                    font-medium flex items-center gap-3 
                    ${
                      isSubmitting
                        ? 'bg-[#8B6B43] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] transform hover:scale-105'
                    }
                    text-black
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(UserSettings, 'user');
