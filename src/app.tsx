import { Component } from "preact";
import { MatrixClient } from "./matrix/client";

export class App extends Component {
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