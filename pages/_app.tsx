import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.min.css';
import type { AppProps } from 'next/app';
import { ClientContext, } from '../components/ClientContext';
import React, { PureComponent } from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { appWithTranslation, i18n } from 'next-i18next';
import Footer from '../components/Footer';
import dynamic from 'next/dynamic';
import MatrixClient from "../helpers/matrix_client";
import Storage from "../helpers/storage";

const HeaderNoSSR = dynamic(
  () => import('../components/Header'),
  { ssr: false }
);

type State = {
  client?: MatrixClient;
  guest_client?: MatrixClient;
};

class MyApp extends PureComponent<AppProps, State> {
  constructor(props: AppProps) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    // Actual user client
    const client = await MatrixClient.init(await Storage.init("main"));

    // Client used if logged in for the Homepage to prevent excessive room joining
    const guest_client = await MatrixClient.init(await Storage.init("guest"));
    this.setState({
      client: client,
      guest_client: guest_client
    });
  }

  render() {
    const Component = this.props.Component;
    if (!this.state.client || !this.state.guest_client) {
      return (
        <div className="m-0 w-full">
          <div className="loader">{i18n?.t("Loading")}...</div>
        </div>
      );
    }
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
              client: this.state.client,
              guest_client: this.state.guest_client,
              is_generating_guest: false,
            }}
          >
            <div className='min-h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]'>
              <HeaderNoSSR></HeaderNoSSR>
              <main className='mb-auto lg:pt-20 pt-52 z-0'>
                <Component {...this.props.pageProps} />
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
}

export default appWithTranslation(MyApp);
