import { render } from 'preact';
import { App } from './app';
import './index.css';


if (import.meta.env.DEV) {
    // Must use require here as import statements are only allowed
    // to exist at top-level.
    // @ts-ignore No types
    import("preact/debug");
}

render(<App />, document.querySelector('#app')!);