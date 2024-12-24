import { jwtDecode } from 'jwt-decode';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { parseCookies } from 'utils/nookies';

const DynamicLoginForm = dynamic(() => import('components/login/LoginForm'), {
  ssr: false,
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);
  const { accessToken } = cookies;
  const { refreshToken } = cookies;

  if (accessToken || refreshToken) {
    try {
      const decodedToken: any = jwtDecode(accessToken);
      return {
        redirect: {
          destination: decodedToken.role === 1 ? '/admin' : '/user',
          permanent: false,
        },
      };
    } catch (error) {
      return {
        props: {},
      };
    }
  }

  return {
    props: {},
  };
};

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const { accessToken } = cookies;

    if (accessToken) {
      try {
        const decodedToken: any = jwtDecode(accessToken);
        router.replace(decodedToken.role === 1 ? '/admin' : '/user');
      } catch (error) {
        toast.error('Invalid token');
      }
    }
  }, [router]);

  return <DynamicLoginForm />;
};

export default Login;
