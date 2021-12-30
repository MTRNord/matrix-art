import type { NextPage } from 'next';
import React from 'react';
import { client, ClientContext } from '../components/ClientContext';
import Home from './Home';

const App: NextPage = () => {
  return (
    <React.StrictMode>
      <ClientContext.Provider
        value={{
          client: client,
        }}
      >
        <Home client={client} />
      </ClientContext.Provider>
    </React.StrictMode>
  );
};

export default App;
