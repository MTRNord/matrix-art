import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import { client, ClientContext } from '../components/ClientContext';
import Home from './Home';

const App: NextPage = () => {
  return (
    <>
      <Head>
        <title key="title">Matrix Art</title>
        <meta key="viewport" name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <React.StrictMode>
        <ClientContext.Provider
          value={{
            client: client,
          }}
        >
          <Home />
        </ClientContext.Provider>
      </React.StrictMode>
    </>
  );
};

export default App;
