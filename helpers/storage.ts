export default class Storage {
    getItem(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(key);
        }
    }

    setItem(key: string, value: any): any {
        if (typeof window !== "undefined") {
            return window.localStorage.setItem(key, value);
        }
    }

    removeItem(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.removeItem(key);
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