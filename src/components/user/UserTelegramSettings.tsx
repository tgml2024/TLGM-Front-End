import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaCheck,
  FaPaperPlane,
  FaPlay,
  FaStop,
  FaTelegram,
} from 'react-icons/fa';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

import { getUserProfile } from '@/services/profileService';
import {
  sendPhone,
  startClient,
  stopClient,
  verifyCode,
} from '@/services/tlg_confrm';

const UserTelegramSettings = () => {
  const [step, setStep] = useState(0); // Step 0: API Info, 1: Phone, 2: OTP
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsClientStarted] = useState(false);
  const [, setIsAuthenticated] = useState(false);
  const [activeApiId, setActiveApiId] = useState(() => {
    return localStorage.getItem('activeApiId') || '';
  });
  const [userProfile, setUserProfile] = useState<any>(null); // Add state to store user profile

  const methods = useForm({
    defaultValues: {
      apiId: '',
      apiHash: '',
      phoneNumber: '',
      otpCode: '',
      userid: '',
      telegram_auth: 0,
    },
  });

  type FormData = {
    apiId: string;
    apiHash: string;
    phoneNumber: string;
    otpCode: string;
    userid: string; // เพิ่ม userid
    telegram_auth: number;
  };

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        setUserProfile(profileData.user);
        setValue('apiId', profileData.user.api_id?.toString() || '');
        setValue('apiHash', profileData.user.api_hash || '');
        setValue('phoneNumber', profileData.user.phone || '');
        setValue('userid', profileData.user.userid.toString());
        setValue('telegram_auth', profileData.user.telegram_auth);

        const isAuth = profileData.user.telegram_auth === 1;
        setIsAuthenticated(isAuth);
        setIsClientStarted(isAuth);

        if (isAuth) {
          setActiveApiId(profileData.user.api_id?.toString() || '');
        }
      } catch (error) {
        toast.error('Cannot fetch profile data');
      }
    };

    fetchProfileData();
  }, [setValue]);

  // Step 0: เริ่มต้น Client
  const handleStartClient = async (data: FormData) => {
    const loadingToast = toast.loading('Starting client...');
    try {
      await startClient(data.apiId, data.apiHash, data.userid);
      // Fetch updated profile after starting client
      const profileData = await getUserProfile();
      setUserProfile(profileData.user);
      setValue('telegram_auth', profileData.user.telegram_auth);

      toast.dismiss(loadingToast);
      toast.success('Client started successfully');
      setIsClientStarted(true);
      setActiveApiId(data.apiId);
      setStep(1);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Cannot start client');
    }
  };

  // Step 1: ส่งเบอร์โทรศัพท์
  const handleSendPhone = async (data: FormData) => {
    try {
      // ตรวจสอบความถูกต้องของเบอร์โทร
      if (!isValidPhoneNumber(data.phoneNumber)) {
        throw new Error('Invalid phone number');
      }

      const response = await sendPhone(
        data.apiId,
        data.phoneNumber, // เบอร์โทรจะอยู่ในรูปแบบ E.164 แล้ว (เช่น +66812345678)
        data.userid
      );
      setPhoneCodeHash(response.phoneCodeHash);
      setStep(2);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  // Step 2: ยืนยัน OTP
  const handleVerifyOTP = async (data: FormData) => {
    const loadingToast = toast.loading('Verifying OTP...');
    try {
      await verifyCode(
        data.apiId,
        data.phoneNumber,
        data.otpCode,
        phoneCodeHash,
        data.userid
      );
      // Fetch updated profile after verification
      const profileData = await getUserProfile();
      setUserProfile(profileData.user);
      setValue('telegram_auth', profileData.user.telegram_auth);

      toast.dismiss(loadingToast);
      toast.success('Login successful!');
      setIsClientStarted(true);
      setIsAuthenticated(true);
      setActiveApiId(data.apiId);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Failed to verify OTP');
      // Reset OTP field on error
      setValue('otpCode', '');
    }
  };

  const handleStepSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (step === 0) {
        await handleStartClient(data);
      } else if (step === 1) {
        await handleSendPhone(data);
      } else if (step === 2) {
        await handleVerifyOTP(data);
      }
    } catch (error) {
      toast.error('Error in process.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (step === 0) {
      return (
        <button
          type="submit"
          disabled={isLoading}
          className="group relative px-8 py-3 text-black font-medium rounded-xl
            overflow-hidden transition-all duration-300
            hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]
            transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Button background with animated gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#D4AF37]
            transition-transform duration-300 group-hover:scale-110"
          ></div>

          {/* Button content */}
          <div className="relative flex items-center gap-3">
            <FaPlay className="text-lg" />
            <span className="font-semibold tracking-wider">Start</span>
          </div>

          {/* Animated border */}
          <div
            className="absolute inset-0 border-2 border-[#FFD700] rounded-xl
            opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </button>
      );
    }
    if (step === 1) {
      return (
        <button
          type="submit"
          disabled={isLoading}
          className="group relative px-8 py-3 text-black font-medium rounded-xl
            overflow-hidden transition-all duration-300
            hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]
            transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#D4AF37]
            transition-transform duration-300 group-hover:scale-110"
          ></div>
          <div className="relative flex items-center gap-3">
            <FaPaperPlane className="text-lg" />
            <span className="font-semibold tracking-wider">Send OTP</span>
          </div>
          <div
            className="absolute inset-0 border-2 border-[#FFD700] rounded-xl
            opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </button>
      );
    }
    if (step === 2) {
      return (
        <button
          type="submit"
          disabled={isLoading}
          className="group relative px-8 py-3 text-black font-medium rounded-xl
            overflow-hidden transition-all duration-300
            hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]
            transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#D4AF37]
            transition-transform duration-300 group-hover:scale-110"
          ></div>
          <div className="relative flex items-center gap-3">
            <FaCheck className="text-lg" />
            <span className="font-semibold tracking-wider">Confirm OTP</span>
          </div>
          <div
            className="absolute inset-0 border-2 border-[#FFD700] rounded-xl
            opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </button>
      );
    }
    return '';
  };

  // เพิ่ม component Stepper
  const renderStepper = () => {
    const steps = [
      { label: 'Start Client', icon: <FaPlay /> },
      { label: 'Confirm Phone', icon: <FaPaperPlane /> },
      { label: 'Confirm OTP', icon: <FaCheck /> },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-center items-center">
          {steps.map((s, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center 
                    transform transition-all duration-300 ease-in-out
                    ${
                      step >= index
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black scale-110 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'bg-[#1A1A1A] text-[#FFD700]/50 border-2 border-[#FFD700]/20'
                    }`}
                >
                  {s.icon}
                </div>
                <p
                  className={`mt-2 text-sm font-medium
                  ${step >= index ? 'text-[#FFD700]' : 'text-[#FFD700]/50'}`}
                >
                  {s.label}
                </p>
                {/* Progress line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-full w-full h-[2px] transform -translate-y-1/2">
                    <div
                      className={`h-full transition-all duration-300 ease-in-out
                      ${
                        step > index
                          ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37]'
                          : 'bg-[#1A1A1A]'
                      }`}
                    />
                  </div>
                )}
              </div>
              {/* Spacer between steps */}
              {index < steps.length - 1 && (
                <div className="w-20 sm:w-32 h-[2px] bg-[#1A1A1A] mx-4">
                  <div
                    className={`h-full transition-all duration-300 ease-in-out
                      ${
                        step > index
                          ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37]'
                          : ''
                      }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Modify handleStopClient to use userProfile
  // ... existing code ...
  const handleStopClient = async () => {
    const loadingToast = toast.loading('กำลังหยุดการทำงานของ Client...');
    try {
      if (!userProfile?.userid || !userProfile?.api_id) {
        throw new Error('ไม่พบข้อมูล User Profile ที่จำเป็น');
      }

      await stopClient(
        userProfile.api_id.toString(),
        userProfile.userid.toString()
      );

      // Fetch updated profile after stopping client
      const profileData = await getUserProfile();
      setUserProfile(profileData.user);
      setValue('telegram_auth', profileData.user.telegram_auth);

      toast.dismiss(loadingToast);
      toast.success('Client stopped successfully');
      setIsClientStarted(false);
      setIsAuthenticated(false);
      setActiveApiId('');
      setStep(0);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Cannot stop client');
    }
  };
  // ... existing code ...

  // Add new component to show working status
  const renderWorkingStatus = () => {
    return (
      <div className="animate__animated animate__fadeInDown">
        <div
          className="mb-8 p-8 bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl 
          border-2 border-[#FFD700]/20 relative overflow-hidden
          shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
          {/* Animated background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="flex space-x-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="relative">
                    <div
                      className="absolute inset-0 bg-[#FFD700] rounded-full blur-md animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    ></div>
                    <div
                      className="w-4 h-4 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-full 
                      shadow-[0_0_15px_rgba(212,175,55,0.5)] relative"
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <FaTelegram
                  className="text-3xl text-[#FFD700] animate-bounce"
                  style={{ animationDuration: '2s' }}
                />
                <h3
                  className="text-2xl font-bold bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] 
                  text-transparent bg-clip-text tracking-wider"
                >
                  Telegram Client Active
                </h3>
              </div>
            </div>

            {/* API Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="group">
                <div
                  className="p-6 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#FFD700]/20
                  transform transition-all duration-300 group-hover:scale-105
                  group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 bg-gradient-to-br from-[#FFD700] to-[#D4AF37] rounded-lg
                      shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                      <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#FFD700]/70 text-sm font-medium mb-1">
                        API Identifier
                      </p>
                      <p className="text-[#FFD700] text-lg font-mono font-bold tracking-wider">
                        {activeApiId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <div
                  className="p-6 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#FFD700]/20
                  transform transition-all duration-300 group-hover:scale-105
                  group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg
                      shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#FFD700]/70 text-sm font-medium mb-1">
                        Connection Status
                      </p>
                      <p className="text-green-500 text-lg font-bold tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Connected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stop Client Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStopClient}
            className="group relative px-8 py-3 text-white font-medium rounded-xl
              overflow-hidden transition-all duration-300
              hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]
              transform hover:scale-105"
          >
            {/* Button background with animated gradient */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700
              transition-transform duration-300 group-hover:scale-110"
            ></div>

            {/* Button content */}
            <div className="relative flex items-center gap-3">
              <FaStop className="text-lg" />
              <span className="font-semibold tracking-wider">Stop Client</span>
            </div>

            {/* Animated border */}
            <div
              className="absolute inset-0 border-2 border-red-500 rounded-xl
              opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="bg-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-5xl font-bold text-center mb-6 sm:mb-12 flex items-center justify-center gap-3 animate__animated animate__fadeIn">
            <FaTelegram
              className="text-[#FFD700] text-3xl sm:text-5xl animate-pulse 
              drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            />
            <span
              className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-transparent bg-clip-text 
              drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]
              hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]
              transition-all duration-300
              tracking-wider
              font-extrabold
              transform hover:scale-105
              border-b-4 border-[#D4AF37]/20
              pb-2"
            >
              Start Telegram Client
            </span>
          </h2>

          <div className="bg-[#0A0A0A] shadow-lg rounded-lg p-4 sm:p-6 border border-[#FFD700]/20">
            {/* Status Section */}
            {userProfile?.telegram_auth === 1 ? (
              renderWorkingStatus()
            ) : (
              <div className="animate__animated animate__fadeInDown">
                {renderStepper()}
                <form
                  onSubmit={handleSubmit(handleStepSubmit)}
                  className="animate__animated animate__fadeInUp"
                >
                  {step === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label
                          htmlFor="apiId"
                          className="block text-sm font-medium text-[#FFD700] mb-2"
                        >
                          API ID
                        </label>
                        <input
                          {...register('apiId', {
                            required: 'API ID is required',
                          })}
                          id="apiId"
                          type="text"
                          className="w-full px-4 py-3 rounded-lg bg-[#1A1A1A] border-2 border-[#FFD700]/30
                            text-[#FFD700] text-lg font-medium
                            focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                            placeholder-[#8B6B43]
                            transition-all duration-300
                            hover:border-[#FFD700]/50"
                        />
                        {errors.apiId && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.apiId.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="apiHash"
                          className="block text-sm font-medium text-[#FFD700] mb-2"
                        >
                          API Hash
                        </label>
                        <input
                          {...register('apiHash', {
                            required: 'API Hash is required',
                          })}
                          id="apiHash"
                          type="text"
                          className="w-full px-4 py-3 rounded-lg bg-[#1A1A1A] border-2 border-[#FFD700]/30
                            text-[#FFD700] text-lg font-medium
                            focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                            placeholder-[#8B6B43]
                            transition-all duration-300
                            hover:border-[#FFD700]/50"
                        />
                        {errors.apiHash && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.apiHash.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="mb-4">
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-[#FFD700] mb-2"
                      >
                        Phone Number
                      </label>
                      <PhoneInput
                        international
                        defaultCountry="TH"
                        value={methods.getValues('phoneNumber')}
                        onChange={(value) =>
                          setValue('phoneNumber', value || '')
                        }
                        className="w-full px-4 py-3 rounded-lg bg-[#1A1A1A] border-2 border-[#FFD700]/30
                          text-[#FFD700] text-lg font-medium
                          focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                          placeholder-[#8B6B43]
                          transition-all duration-300
                          hover:border-[#FFD700]/50"
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="mb-4">
                      <label
                        htmlFor="otpCode"
                        className="block text-sm font-medium text-[#FFD700] mb-2"
                      >
                        OTP Code
                      </label>
                      <input
                        {...register('otpCode', {
                          required: 'OTP Code is required',
                        })}
                        id="otpCode"
                        type="text"
                        className="w-full px-4 py-3 rounded-lg bg-[#1A1A1A] border-2 border-[#FFD700]/30
                          text-[#FFD700] text-lg font-medium
                          focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                          placeholder-[#8B6B43]
                          transition-all duration-300
                          hover:border-[#FFD700]/50"
                      />
                      {errors.otpCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.otpCode.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    {getButtonLabel()}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default UserTelegramSettings;
