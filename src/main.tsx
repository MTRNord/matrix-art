import { render } from 'preact';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import './index.css';


if (import.meta.env.DEV) {
    // Must use require here as import statements are only allowed
    // to exist at top-level.
    // @ts-ignore No types
    import("preact/debug");
}

render(
    <BrowserRouter basename={`${import.meta.env.BASE_URL}`}>
        <App />
    </BrowserRouter>,
    document.querySelector('#app')!
);