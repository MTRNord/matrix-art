import Head from 'next/head';
import React, { PureComponent } from 'react';
import { guest_client, client, ClientContext } from '../components/ClientContext';
import MatrixClient from '../helpers/matrix_client';
import Home from './Home';

type Props = {

};

type State = {
  value: { client: MatrixClient; guest_client: MatrixClient; };
};
class App extends PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      value: {
        client: client,
        guest_client: guest_client,
      },
    };
  }
  render() {
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
            value={this.state.value}
          >
            <Home />
          </ClientContext.Provider>
        </React.StrictMode>
      </>
    );
  }
}

export default App;
