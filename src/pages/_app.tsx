import './globals.css';
import '../styles/UserSidebar.styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { AuthProvider } from 'context/AuthContext';
import AdminLayout from 'layout/AdminLayout';
import AuthLayout from 'layout/AuthLayout';
import Layout from 'layout/Layout';
import UserLayout from 'layout/UserLayout';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { Toaster } from 'react-hot-toast';

import pageTitles from '@/config/pageTitles';

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const router = useRouter();

  axios.defaults.withCredentials = true;

  const getLayoutComponent = () => {
    switch (true) {
      case router.pathname === '/' || router.pathname === '/landing':
        return Layout;
      case router.pathname.startsWith('/login'):
        return AuthLayout;
      case router.pathname.startsWith('/admin'):
        return AdminLayout;
      case router.pathname.startsWith('/user'):
        return UserLayout;
      default:
        return Layout;
    }
  };

  const LayoutComponent = getLayoutComponent();
  const title = pageTitles[router.pathname] || 'TLGM Message';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" />
        <AuthProvider>
          <main>
            <LayoutComponent>
              <Component {...pageProps} />
            </LayoutComponent>
          </main>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
