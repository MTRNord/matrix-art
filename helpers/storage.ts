const STORAGE_VERSION = 6;
export default class Storage {
    private constructor(private prefix: string, private localFolder?: string) { }

    public static async init(prefix: string): Promise<Storage> {
        if (typeof window === "undefined") {
            const path = await import('path');
            const fs = await import('fs');
            const dir = path.join(process.cwd(), "localstorage");
            const dir_with_prefix = path.join(dir, prefix);
            try {
                await fs.promises.stat(dir_with_prefix);
            } catch {
                await fs.promises.mkdir(dir_with_prefix, { recursive: true });
            }
            return new Storage(prefix, dir);
        } else {
            return new Storage(prefix);
        }
    }

    private async ensureVersion() {
        let version;
        if (typeof window !== "undefined") {
            const localforage = await import('localforage');
            version = await localforage.getItem("version");
        } else {
            try {
                const fs = await import('fs');
                const path = await import('path');
                version = await fs.promises.readFile(path.join(this.localFolder!, "version"), { encoding: "utf8" });
            } catch {
                //No-op
            }
        }
        if (version === undefined || version === null || version !== STORAGE_VERSION.toString()) {
            if (typeof window !== "undefined") {
                const localforage = await import('localforage');
                await localforage.clear();
                await localforage.setItem("version", STORAGE_VERSION.toString());
            } else {
                const fs = await import('fs');
                const path = await import('path');
                try {
                    const stat = await fs.promises.stat(path.join(this.localFolder!, "version"));
                    if (stat.isFile()) {
                        await fs.promises.unlink(path.join(this.localFolder!, "version"));
                    }
                } catch { }
                await fs.promises.writeFile(path.join(this.localFolder!, "version"), STORAGE_VERSION.toString(), { encoding: "utf8", flag: "w+" });
            }
        }
    }

    async getItem(key: string): Promise<string | undefined> {
        this.ensureVersion();
        if (typeof window !== "undefined") {
            const localforage = await import('localforage');
            const item = await localforage.getItem(this.prefix + key) as string | null;
            if (item === null) {
                return undefined;
            }
            return item;
        } else {
            try {
                const fs = await import('fs');
                const path = await import('path');
                try {
                    const stat = await fs.promises.stat(path.join(this.localFolder!, this.prefix, key));
                    if (stat.isFile()) {
                        return fs.promises.readFile(path.join(this.localFolder!, this.prefix, key), { encoding: "utf8" });
                    }
                } catch { }
            } catch {
                //No-op
            }
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        this.ensureVersion();
        if (typeof window !== "undefined") {
            const localforage = await import('localforage');
            await localforage.setItem(this.prefix + key, value);
        } else {
            try {
                const fs = await import('fs');
                const path = await import('path');
                return await fs.promises.writeFile(path.join(this.localFolder!, this.prefix, key), value, { encoding: "utf8", flag: "w+" });
            } catch {
                //No-op
            }
        }
    }

    async removeItem(key: string): Promise<void> {
        this.ensureVersion();
        if (typeof window !== "undefined") {
            const localforage = await import('localforage');
            await localforage.removeItem(this.prefix + key);
        } else {
            try {
                const fs = await import('fs');
                const path = await import('path');
                try {
                    const file_path = path.join(this.localFolder!, this.prefix, key);
                    const stat = await fs.promises.stat(file_path);
                    console.log("file_path:", file_path);
                    console.log("stat:", stat.isFile());
                    if (stat.isFile()) {
                        console.log("unlink");
                        await fs.promises.unlink(file_path);
                        console.log("unlinked");
                    }
                } catch { }
            } catch {
                //No-op
            }
        }
    }

    async setOrDelete(key: string, value?: string): Promise<void> {
        if (value) {
            await this.setItem(key, value);
        } else {
            await this.removeItem(key);
        }
    }
}