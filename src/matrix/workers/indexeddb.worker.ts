/*
Copyright 2017 Vector Creations Ltd
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { IndexedDBStoreWorker } from "matrix-js-sdk/lib/indexeddb-worker";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

const remoteWorker = new IndexedDBStoreWorker(ctx.postMessage);

// eslint-disable-next-line unicorn/prefer-add-event-listener
ctx.onmessage = remoteWorker.onMessage;