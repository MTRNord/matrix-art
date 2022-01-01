export default class Storage {
    private prefix;
    private nodeLocalStorage?;
    constructor(prefix: string) {
        this.prefix = prefix;
        if (typeof window === "undefined") {
            var LocalStorage = require('node-localstorage').LocalStorage;
            var path = require('path');
            this.nodeLocalStorage = new LocalStorage(path.join(process.cwd(), "localstorage"));
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