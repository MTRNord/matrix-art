import { render } from 'preact';
import { App } from './app';
import './index.css';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import olmWasmPath from "@matrix-org/olm/olm.wasm?url";
import OlmLegacy from '@matrix-org/olm/olm_legacy.js?url';
import Olm from '@matrix-org/olm';
import { MatrixClient } from './matrix/client';

if (import.meta.env.DEV) {
    // Must use require here as import statements are only allowed
    // to exist at top-level.
    // @ts-ignore No types
    import("preact/debug");
}

function loadOlm(): Promise<void> {
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

function load() {
    MatrixClient.new().then((client) => {
        // @ts-ignore its fine...
        window.client = client;
        client.start().then(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            render(<App />, document.querySelector('#app')!);
        });
    });
}

loadOlm().then((): void => {
    load();
}).catch(() => {
    load();
});