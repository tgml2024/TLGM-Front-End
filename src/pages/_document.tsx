import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html lang="th">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />
          <meta
            name="description"
            content="TLGM - ระบบส่งข้อความอัตโนมัติใน Telegram"
          />
          <meta
            name="keywords"
            content="TLGM,Telegram Auto Message, Automated Messages,tlgm ,Telegram Chatbot , Telegram Auto Message System, Telegram Forward ,ปัญญาประดิษฐ์,ระบบส่งข้อความอัตโนมัติใน Telegram สำหรับธุรกิจ,วิธีตั้งค่า Telegram Bot ให้ส่งข้อความอัตโนมัติ,ระบบส่งข้อความอัตโนมัติบน Telegram"
          />
          <meta property="og:title" content="TLGM Web Application" />
          <meta
            property="og:description"
            content="TLGM - ระบบส่งข้อความอัตโนมัติใน Telegram"
          />
          <meta property="og:url" content="https://tlgm.xyz" />
          <meta property="og:image" content="/images/og-image.webp" />
          <meta property="og:type" content="website" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
