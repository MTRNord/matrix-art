export default class Storage {
    private nodeLocalStorage?;
    constructor() {
        if (typeof window === "undefined") {
            var LocalStorage = require('node-localstorage').LocalStorage;
            var path = require('path');
            this.nodeLocalStorage = new LocalStorage(path.join(process.cwd(), "localstorage"));
        }
    }
    getItem(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(key);
        } else {
            return this.nodeLocalStorage?.getItem(key);
        }
    }

    setItem(key: string, value: any): any {
        if (typeof window !== "undefined") {
            return window.localStorage.setItem(key, value);
        } else {
            return this.nodeLocalStorage?.setItem(key, value);
        }
    }

    removeItem(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.removeItem(key);
        } else {
            return this.nodeLocalStorage?.removeItem(key);
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