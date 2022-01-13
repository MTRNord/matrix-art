import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { client, ClientContext, guest_client } from '../components/ClientContext';
import React from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const [value, setValue] = useState({
    client: client,
    guest_client: guest_client,
  });
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
          value={value}
        >
          <Component {...pageProps}/>
        </ClientContext.Provider>
      </React.StrictMode>
    </>
  );
}

export default MyApp;
