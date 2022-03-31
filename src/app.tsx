import { PureComponent } from 'preact/compat';
import { MatrixClient } from "./matrix/client";

export class App extends PureComponent {
  async componentDidMount() {
    const client = await MatrixClient.new();
    await client.start();
  }
  render() {
    return (
      <div>
        <h1>Hello World</h1>
      </div>
    );
  }
}