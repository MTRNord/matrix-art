import Router from 'preact-router';
import { PureComponent } from 'preact/compat';
import { Home } from './pages/Home';
import { MatrixClient } from "./matrix/client";

export class App extends PureComponent {
  async componentDidMount() {
    const client = await MatrixClient.new();
    await client.start();
  }
  render() {
    return (
      <Router>
        <Home path="/" />
      </Router>
    );
  }
}