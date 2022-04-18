import Router from 'preact-router';
import { lazy, PureComponent, Suspense } from 'preact/compat';
import { Home } from './pages/Home';
import { Client } from './context';
import { Header } from './components/header';
import { MatrixClient } from './matrix/client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import olmWasmPath from "@matrix-org/olm/olm.wasm?url";
import OlmLegacy from '@matrix-org/olm/olm_legacy.js?url';
import Olm from '@matrix-org/olm';

const Join = lazy(() => import("./pages/Join"));

type State = {
  client?: MatrixClient;
};

export class App extends PureComponent<any, State> {
  constructor() {
    super();
    this.state = {
      client: undefined
    };
  }

  loadOlm(): Promise<void> {
    /* Load Olm. We try the WebAssembly version first, and then the legacy */
    return Olm.init({
      locateFile: () => olmWasmPath,
    }).then(() => {
      console.log("Using WebAssembly Olm");
    }).catch((e) => {
      console.log("Failed to load Olm: trying legacy version", e);
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = OlmLegacy; // XXX: This should be cache-busted too
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      }).then(() => {
        // Init window.Olm, ie. the one just loaded by the script tag,
        // not 'Olm' which is still the failed wasm version.
        return window.Olm.init();
      }).then(() => {
        console.log("Using legacy Olm");
      }).catch((e) => {
        console.log("Both WebAssembly and asm.js Olm failed!", e);
      });
    });
  };

  async loadMatrixClient() {
    let client = await MatrixClient.new();
    // @ts-ignore its fine...
    this.setState({ client });
    console.log("Client loaded");
    await this.state.client?.start();
    console.log("Client started");
  }

  async componentDidMount() {
    try {
      await this.loadOlm();
      console.log("Olm loaded");
    } catch {
      console.log("Olm not loaded");
    }
    await this.loadMatrixClient();
  }

  render() {
    return (

      <Suspense fallback={
        <div class="flex flex-col">
          <header>
            <Header />
          </header>
          <main class="m-12 mt-6 flex items-center justify-center">
            <p class="text-lg text-data font-bold">Loading...</p>
          </main>
        </div>
      }>

        <Client.Provider value={
          this.state.client
        }>
          <Router>
            <Home path={`${import.meta.env.BASE_URL}/`} />
            <Join path={`${import.meta.env.BASE_URL}/join`} />
          </Router>
        </Client.Provider>
      </Suspense>
    );
  }
}