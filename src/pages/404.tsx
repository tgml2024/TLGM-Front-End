import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

/// หน้า Error หรือ 404 เพิ่มเนื้อหาเมื่อไม่เจอหน้าของเว็บ จะมีปุ่มกลับไปหน้าหลัก และ Resirect ไปเองได้ 10 วิ
export default function Custom404() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        // กลับไปยังหน้าหลักเมื่อนับถอยหลังครบ
        clearInterval(intervalId);
        router.push('/');
      }
    }, 1000);

    // เคลียเวลาของฟังก์ชั่นนับถอยหลัง
    return () => clearInterval(intervalId);
  }, [countdown, router]);

  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold mt-8 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" passHref>
        <button className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
          Go back to homepage
        </button>
      </Link>
      <p className="text-sm text-gray-500 mt-12">
        {countdown > 0
          ? `Auto redirecting in ${countdown} seconds...`
          : 'Redirecting now...'}
      </p>
    </div>
  );
}
