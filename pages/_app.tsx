import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.min.css';
import type { AppProps } from 'next/app';
import { client, ClientContext, guest_client } from '../components/ClientContext';
import React from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { appWithTranslation } from 'next-i18next';
import Footer from '../components/Footer';
import dynamic from 'next/dynamic';

const HeaderNoSSR = dynamic(
  () => import('../components/Header'),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title key="title">Matrix Art</title>
        <meta property="og:title" content="Matrix Art" key="og-title" />
        <meta property="og:type" content="website" key="og-type" />
        <meta key="viewport" name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <React.StrictMode>
        <ClientContext.Provider
          value={{
            client: client,
            guest_client: guest_client,
            is_generating_guest: false,
          }}
        ><div className='min-h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]'>
            <HeaderNoSSR></HeaderNoSSR>
            <main className='mb-auto lg:pt-20 pt-52 z-0'>
              <Component {...pageProps} />
            </main>
            <Footer></Footer>
          </div>
        </ClientContext.Provider>
      </React.StrictMode>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default appWithTranslation(MyApp);
