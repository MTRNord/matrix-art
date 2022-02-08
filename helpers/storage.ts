const STORAGE_VERSION = 4;
export default class Storage {
    private prefix;
    private nodeLocalStorage?: any;
    constructor(prefix: string) {
        this.prefix = prefix;
        if (typeof window === "undefined") {
            var LocalStorage = require('node-localstorage').LocalStorage; // eslint-disable-line unicorn/prefer-module
            var path = require('node:path'); // eslint-disable-line unicorn/prefer-module
            var fs = require('node:fs'); // eslint-disable-line unicorn/prefer-module
            const dir = path.join(process.cwd(), "localstorage");
            if (!fs.existsSync(dir)) {
                try {
                    fs.mkdirSync(dir);
                } catch { console.log("race while folder was checked"); }
            }
            this.nodeLocalStorage = new LocalStorage(dir);
        }
    }
    private ensureVersion() {
        let version;
        if (typeof window !== "undefined") {
            version = window.localStorage.getItem("version");
        } else {
            try {
                version = this.nodeLocalStorage?.getItem("version");
            } catch {
                //No-op
            }
        }
        if (version === undefined || version === null || version !== STORAGE_VERSION.toString()) {
            if (typeof window !== "undefined") {
                window.localStorage.clear();
                window.localStorage.setItem("version", STORAGE_VERSION.toString());
            } else {
                this.nodeLocalStorage?.clear();
                this.nodeLocalStorage?.setItem("version", STORAGE_VERSION.toString());
            }
        }
    }

    getItem(key: string): string | undefined {
        this.ensureVersion();
        if (typeof window !== "undefined") {
            const item = window.localStorage.getItem(this.prefix + key);
            if (item === null) {
                return undefined;
            }
            return item;
        } else {
            try {
                return this.nodeLocalStorage?.getItem(this.prefix + key);
            } catch {
                //No-op
            }
        }
    }

    setItem(key: string, value: string): void {
        this.ensureVersion();
        if (typeof window !== "undefined") {
            return window.localStorage.setItem(this.prefix + key, value);
        } else {
            try {
                return this.nodeLocalStorage?.setItem(this.prefix + key, value);
            } catch {
                //No-op
            }
        }
    }

    removeItem(key: string): void {
        this.ensureVersion();
        if (typeof window !== "undefined") {
            return window.localStorage.removeItem(this.prefix + key);
        } else {
            try {
                return this.nodeLocalStorage?.removeItem(this.prefix + key);
            } catch {
                //No-op
            }
        }
    }

    setOrDelete(key: string, value: string | undefined): void {
        if (value) {
            this.setItem(key, value);
        } else {
            this.removeItem(key);
        }
    }
}