import Router from 'preact-router';
import { lazy, PureComponent, Suspense } from 'preact/compat';
import { Home } from './pages/Home';
import { Client } from './context';
import { Header } from './components/header';

const Join = lazy(() => import("./pages/Join"));

export class App extends PureComponent {

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
          // @ts-ignore its fine... 
          window.client
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