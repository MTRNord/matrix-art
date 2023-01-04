import { lazy, useEffect, Suspense, useState } from 'react';
import { Home } from './pages/Home';
import { Client } from './context';
import { Header } from './components/header';
import { MatrixClient } from './matrix/client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import olmWasmPath from "@matrix-org/olm/olm.wasm?url";
import OlmLegacy from '@matrix-org/olm/olm_legacy.js?url';
import Olm from '@matrix-org/olm';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Join = lazy(() => import("./pages/Join"));
const Post = lazy(() => import("./pages/Post"));
const Profile = lazy(() => import("./pages/Profile"));


const loadOlm = (): Promise<void> => {
  /* Load Olm. We try the WebAssembly version first, and then the legacy */
  return Olm.init({
    locateFile: () => olmWasmPath,
  }).then(() => {
    console.log("Using WebAssembly Olm");
  }).catch((error) => {
    console.log("Failed to load Olm: trying legacy version", error);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = OlmLegacy; // XXX: This should be cache-busted too
      s.addEventListener('load', resolve);
      s.addEventListener('error', reject);
      document.body.append(s);
    }).then(() => {
      // Init window.Olm, ie. the one just loaded by the script tag,
      // not 'Olm' which is still the failed wasm version.
      return window.Olm.init();
    }).then(() => {
      console.log("Using legacy Olm");
    }).catch((error) => {
      console.log("Both WebAssembly and asm.js Olm failed!", error);
    });
  });
};


export function App() {
  // eslint-disable-next-line unicorn/no-useless-undefined
  const [client, setClient] = useState<MatrixClient | undefined>(undefined);

  const loadMatrixClient = async () => {
    const client = await MatrixClient.new();
    setClient(client);
    console.log("Client loaded");
    await client?.start();
    console.log("Client started");
  }

  useEffect(() => {
    async function loadMatrix() {
      try {
        await loadOlm();
        console.log("Olm loaded");
      } catch {
        console.log("Olm not loaded");
      }
      await loadMatrixClient();
    }

    if (client == undefined) {
      loadMatrix();
    }
  }, []);

  return (
    <Client.Provider value={
      client
    }>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="join" element={
          <Suspense fallback={<LoadingPage />}>
            <Join />
          </Suspense>
        } />
        <Route path="/post/:postId" element={
          <Suspense fallback={<LoadingPage />}>
            <Post />
          </Suspense>
        } />
        <Route path="/profile/:userId" element={
          <Suspense fallback={<LoadingPage />}>
            <Profile />
          </Suspense>
        } />
      </Routes>
    </Client.Provider >
  );
}

function LoadingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <header>
        <Header />
      </header>
      <main className="m-12 mt-6 flex items-center justify-center">
        <p className="text-lg text-data font-bold">{t('Loading…')}</p>
      </main>
    </div>
  );
}