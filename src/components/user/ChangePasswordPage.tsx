import { KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { ChangePassword } from '@/services/changepasswordService';
import { getUserProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      const profile = await getUserProfile();
      const userId = profile.user.userid;

      const response = await ChangePassword({
        userId: userId.toString(),
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        toast.success(response.message || 'Password changed successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      // Handle specific error messages
      if (error.message.includes('Current password is incorrect')) {
        toast.error('Current password is incorrect');
      } else if (error.message.includes('User not found')) {
        toast.error('User not found');
      } else {
        toast.error(
          error.message || 'An error occurred while changing password'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <LockClosedIcon className="w-8 h-8 text-[#FFD700] transform hover:rotate-12 transition-transform duration-500" />
            </div>
            <h1
              className="text-2xl font-semibold bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] 
              text-transparent bg-clip-text tracking-wide"
            >
              Change Password
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
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
                <KeyIcon className="w-6 h-6 text-[#FFD700]" />
                Password Settings
              </h3>
              <p className="mt-2 text-sm text-[#8B6B43]">
                Update your password to keep your account secure
              </p>
            </div>

            <div className="p-8 space-y-6">
              {/* Current Password */}
              <div className="space-y-2 group">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-[#D4AF37]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <KeyIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                    Current Password
                  </div>
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                  text-[#FFD700] placeholder-[#8B6B43]
                  focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                  transition-all duration-300 hover:border-[#FFD700]/50
                  shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                  placeholder="Enter your current password"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2 group">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#D4AF37]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <KeyIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                    New Password
                  </div>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                  text-[#FFD700] placeholder-[#8B6B43]
                  focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                  transition-all duration-300 hover:border-[#FFD700]/50
                  shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                  placeholder="Enter your new password"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2 group">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#D4AF37]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <KeyIcon className="w-5 h-5 text-[#8B6B43] group-hover:text-[#FFD700] transition-colors duration-300" />
                    Confirm New Password
                  </div>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-[#FFD700]/30 bg-black/40 px-4 py-3 
                  text-[#FFD700] placeholder-[#8B6B43]
                  focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                  transition-all duration-300 hover:border-[#FFD700]/50
                  shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_2px_15px_rgba(212,175,55,0.1)]"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 bg-black/40 border-t border-[#FFD700]/20">
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="px-8 py-3 text-sm font-medium text-[#8B6B43] hover:text-[#D4AF37] 
                  transition-colors duration-300 rounded-xl hover:bg-black/40"
                  disabled={isSubmitting}
                >
                  Cancel
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Change Password'
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

export default withAuth(ChangePasswordPage, 'user');
