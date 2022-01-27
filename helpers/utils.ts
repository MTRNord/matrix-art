export interface IDeferred<T> {
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
    promise: Promise<T>;
}

// Returns a Deferred
export function defer<T = void>(): IDeferred<T> {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    return { resolve, reject, promise };
}