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

export function getLicenseUrl(license_type: string): string {
    switch (license_type) {
        case "cc-by-4.0":
            return "https://creativecommons.org/licenses/by/4.0/";
        case "cc-by-sa-4.0":
            return "https://creativecommons.org/licenses/by-sa/4.0/";
        case "cc-by-nc-4.0":
            return "https://creativecommons.org/licenses/by-nc/4.0/";
        case "cc-by-nc-sa-4.0":
            return "https://creativecommons.org/licenses/by-nc-sa/4.0/";
        case "cc-by-nd-4.0":
            return "https://creativecommons.org/licenses/by-nd/4.0/";
        case "cc-by-nc-nd-4.0":
            return "https://creativecommons.org/licenses/by-nc-nd/4.0/";
        case "CC0-1.0":
            return "https://creativecommons.org/publicdomain/zero/1.0/";
        default:
            return "";
    }
}

export function getLicenseName(license_type: string): string {
    switch (license_type) {
        case "cc-by-4.0":
            return "Attribution 4.0 International (CC BY 4.0)";
        case "cc-by-sa-4.0":
            return "Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)";
        case "cc-by-nc-4.0":
            return "Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)";
        case "cc-by-nc-sa-4.0":
            return "Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)";
        case "cc-by-nd-4.0":
            return "Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)";
        case "cc-by-nc-nd-4.0":
            return "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)";
        case "CC0-1.0":
            return "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication";
        default:
            return "Unknown License";
    }
}