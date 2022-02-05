const STORAGE_VERSION = 2;
export default class Storage {
    private prefix;
    private nodeLocalStorage?;
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
        let version;
        if (typeof window !== "undefined") {
            version = window.localStorage.getItem("version");
        } else {
            version = this.nodeLocalStorage?.getItem("version");
        }
        console.log("storage_version:", version);
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
    getItem(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(this.prefix + key);
        } else {
            return this.nodeLocalStorage?.getItem(this.prefix + key);
        }
    }

    setItem(key: string, value: any): any {
        if (typeof window !== "undefined") {
            return window.localStorage.setItem(this.prefix + key, value);
        } else {
            return this.nodeLocalStorage?.setItem(this.prefix + key, value);
        }
    }

    removeItem(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.removeItem(this.prefix + key);
        } else {
            return this.nodeLocalStorage?.removeItem(this.prefix + key);
        }
    }

    setOrDelete(key: string, value: any) {
        if (value) {
            this.setItem(key, value);
        } else {
            this.removeItem(key);
        }
    }
}