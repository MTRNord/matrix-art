import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import { guest_client, client, ClientContext } from '../components/ClientContext';
import Home from './Home';

const App: NextPage = () => {
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
          }}
        >
          <Home />
        </ClientContext.Provider>
      </React.StrictMode>
    </>
  );
};

export default App;
