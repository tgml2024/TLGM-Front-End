import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { login } from '@/services/loginService';

type LoginFormProps = {};

type FormInputs = {
  username: string;
  password: string;
};

const LoginForm: React.FC<LoginFormProps> = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.dismiss();
      toast.success('เข้าสู่ระบบสำเร็จ');
      sessionStorage.setItem('userData', JSON.stringify(data.user));
      if (data.user.role === 0) {
        router.replace('/user');
      } else if (data.user.role === 1) {
        router.replace('/admin');
      }
    },
    onError: () => {
      toast.dismiss();
      toast.error('เข้าสู่ระบบล้มเหลว');
    },
  });

  const onSubmit = handleSubmit((data) => {
    toast.loading('กำลังเข้าสู่ระบบ...');
    loginMutation.mutate(data);
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center 
      login-animate-gradient px-4 py-8"
    >
      <div
        className="bg-gradient-to-b from-[#111111] to-black
        p-6 sm:p-10 rounded-3xl
        shadow-[0_0_50px_rgba(0,0,0,0.3)]
        border border-[#D4AF37]/20 
        backdrop-blur-xl
        w-full max-w-[440px]
        relative
        hover:shadow-[0_0_60px_rgba(212,175,55,0.2)]
        transition-all duration-500"
      >
        {/* Ambient light effect */}
        <div
          className="absolute inset-0 
          bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent 
          rounded-3xl opacity-50
          group-hover:opacity-70
          transition-opacity duration-500"
        />

        {/* Logo Container */}
        <div
          className="relative mb-6 sm:mb-10 
          bg-gradient-to-r from-[#D4AF37] via-[#F4CD6F] to-[#B38B59]
          rounded-2xl overflow-hidden
          shadow-[0_0_25px_rgba(212,175,55,0.3)]
          border border-[#D4AF37]/40
          group
          hover:shadow-[0_0_35px_rgba(244,205,111,0.4)]
          hover:border-[#F4CD6F]/50
          transition-all duration-500 ease-in-out
          transform hover:scale-[1.02]"
        >
          {/* Enhanced shine effect */}
          <div
            className="absolute inset-0 
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            -translate-x-[200%] group-hover:translate-x-[200%]
            transition-transform duration-1000 ease-out"
          />
          <Image
            src="/images/logo.png"
            width={300}
            height={100}
            alt="Logo"
            quality={100}
            priority
            className="w-full h-auto relative z-10
              mix-blend-multiply dark:mix-blend-normal
              transition-all duration-300
              group-hover:brightness-110"
          />
        </div>

        <h2 className="login-gold-shimmer text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center">
          Login
        </h2>

        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Username Input */}
          <div>
            <label
              className="block text-sm font-semibold text-[#F4CD6F] mb-2 
              drop-shadow-[0_0_8px_rgba(244,205,111,0.2)]"
            >
              Username
            </label>
            <div className="relative">
              <input
                {...register('username', { required: 'Username is required' })}
                type="text"
                className="pl-12 pr-4 py-3.5 w-full rounded-xl
                  bg-[#1A1A1A] border-2 border-[#D4AF37]/20
                  text-gray-100 placeholder-gray-500
                  focus:border-[#F4CD6F] focus:ring-2 focus:ring-[#D4AF37]/20 
                  transition-all duration-300
                  hover:border-[#D4AF37]/30"
                placeholder="Enter username"
              />
              <span className="absolute left-4 top-4 text-[#B38B59]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              className="block text-sm font-semibold text-[#F4CD6F] mb-2 
              drop-shadow-[0_0_8px_rgba(244,205,111,0.2)]"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                className="pl-12 pr-12 py-3.5 w-full rounded-xl
                  bg-[#1A1A1A] border-2 border-[#D4AF37]/20
                  text-gray-100 placeholder-gray-500
                  focus:border-[#F4CD6F] focus:ring-2 focus:ring-[#D4AF37]/20 
                  transition-all duration-300
                  hover:border-[#D4AF37]/30"
                placeholder="Enter password"
              />
              <span className="absolute left-4 top-4 text-[#B38B59]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-[#B38B59] hover:text-[#D4AF37] transition-colors duration-200"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3.5 rounded-xl
              relative overflow-hidden group
              text-white font-semibold text-lg
              bg-gradient-to-r from-[#D4AF37] via-[#F4CD6F] to-[#B38B59]
              shadow-[0_0_20px_rgba(212,175,55,0.3)]
              hover:shadow-[0_0_30px_rgba(244,205,111,0.4)]
              transform hover:scale-[1.02]
              disabled:opacity-70 
              transition-all duration-300
              flex items-center justify-center"
          >
            {/* Enhanced shine effect */}
            <div
              className="absolute inset-0 
              bg-gradient-to-r from-transparent via-white/40 to-transparent
              -translate-x-[200%] group-hover:translate-x-[200%]
              transition-transform duration-1000 ease-out"
            />

            {loginMutation.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="relative">Logging in...</span>
              </>
            ) : (
              <span className="relative">Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
