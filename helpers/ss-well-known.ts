import { promises } from "node:dns";
import { isIP } from "node:net";

type SSWellKnownContent = {
    "m.server": string;
};

type OpenIDResp = {
    sub: string;
};

export default class ServerOpenID {
    private resolver = new promises.Resolver();
    private splitRegex = /(.*)(:)(\d+)$/;

    constructor() {
        this.resolver.setServers(['95.217.202.35', '8.8.8.8', '8.8.4.4']);
    }

    private async lookupWellKnown(server: string): Promise<{ address: string; host_header: string; } | undefined> {
        // Step 3 of server resolving
        const resp = await fetch(`https://${server}/.well-known/matrix/server`, { method: "GET" });
        if (resp.status === 200) {
            console.log("Step 3");
            const data: SSWellKnownContent = await resp.json();


            // If we have 1 part we have no port. If we have 5 we have a port.
            // This regex gives us the port at index 4 and ip at index 1.
            const delegatedServer = data["m.server"];
            const possibleDelegatedServerParts = delegatedServer.split(this.splitRegex);
            if (possibleDelegatedServerParts.length === 1) {
                // Step 3.1
                console.log("Step 3.1");
                if (isIP(possibleDelegatedServerParts[0]) > 0) {
                    return { address: `${delegatedServer}:8448`, host_header: delegatedServer };
                } else {
                    // Step 3.3.1
                    console.log("Step 3.3.1");
                    const srv = await this.resolver.resolveSrv(`_matrix._tcp.${possibleDelegatedServerParts[0]}`);
                    if (srv.length > 0) {
                        // Step 3.3.3
                        console.log("Step 3.3.3");
                        if (isIP(srv[0].name) > 0) {
                            return { address: `${srv[0].name}:${srv[0].port}`, host_header: delegatedServer };
                        } else {
                            console.log("Step 3.3.2");
                            // Step 3.3.2
                            const result_v4 = await this.resolver.resolve(srv[0].name, "A");
                            if (result_v4.length > 0) {
                                return { address: `${result_v4[0]}:${srv[0].port}`, host_header: delegatedServer };
                            }

                            const result_v6 = await this.resolver.resolve(srv[0].name, "AAAA");
                            if (result_v6.length > 0) {
                                return { address: `[${result_v6[0]}]:${srv[0].port}`, host_header: delegatedServer };
                            }
                            throw new Error("Unable to resolve the server");
                        }
                    } else {
                        // Step 3.4
                        console.log("Step 3.4");
                        const result_v4 = await this.resolver.resolve(possibleDelegatedServerParts[0], "A");
                        if (result_v4.length > 0) {
                            return { address: `${result_v4[0]}:8448`, host_header: delegatedServer };
                        }

                        const result_v6 = await this.resolver.resolve(possibleDelegatedServerParts[0], "AAAA");
                        if (result_v6.length > 0) {
                            return { address: `[${result_v6[0]}]:8448`, host_header: delegatedServer };
                        }

                        throw new Error("Unable to resolve the server");
                    }
                }
            } else if (possibleDelegatedServerParts.length === 5) {
                // Step 3.1
                if (isIP(possibleDelegatedServerParts[1]) > 0) {
                    console.log("Step 3.1");
                    return { address: delegatedServer, host_header: delegatedServer };
                } else {
                    // Step 3.2
                    console.log("Step 3.2");
                    const result_v4 = await this.resolver.resolve(possibleDelegatedServerParts[1], "A");
                    if (result_v4.length > 0) {
                        return { address: `${result_v4[0]}:${possibleDelegatedServerParts[4]}`, host_header: delegatedServer };
                    }

                    const result_v6 = await this.resolver.resolve(possibleDelegatedServerParts[1], "AAAA");
                    if (result_v6.length > 0) {
                        return { address: `[${result_v6[0]}]:${possibleDelegatedServerParts[4]}`, host_header: delegatedServer };
                    }

                    throw new Error("Unable to resolve the server");
                }
            }
        }
        return undefined;
    }

    private async lookup(server: string): Promise<{ address: string; host_header: string; }> {
        // If we have 1 part we have no port. If we have 5 we have a port.
        // This regex gives us the port at index 4 and ip at index 1.
        const possibleServerParts = server.split(this.splitRegex);

        // Step 1 of Server Discovery
        if (possibleServerParts.length === 1) {
            if (isIP(possibleServerParts[0]) > 0) {
                console.log("Step 1a");
                return { address: `${server}:8448`, host_header: server };
            }
        } else if (possibleServerParts.length === 5) {
            if (isIP(possibleServerParts[1]) > 0) {
                console.log("Step 1b");
                return { address: server, host_header: server };
            } else {
                // Step 2 of Server Discovery.
                console.log("Step 2");
                const result_v4 = await this.resolver.resolve(possibleServerParts[1], "A");
                if (result_v4.length > 0) {
                    return { address: `${result_v4[0]}:${possibleServerParts[4]}`, host_header: server };
                }

                const result_v6 = await this.resolver.resolve(possibleServerParts[1], "AAAA");
                if (result_v6.length > 0) {
                    return { address: `[${result_v6[0]}]:${possibleServerParts[4]}`, host_header: server };
                }

                throw new Error("Unable to resolve the server");
            }
        }
        try {
            const wellKnownResult = await this.lookupWellKnown(server);
            if (wellKnownResult) {
                return wellKnownResult;
            }
        } catch (error) {
            throw error;
        }
        // Step 4
        const srv = await this.resolver.resolveSrv(`_matrix._tcp.${server}`);
        if (srv.length > 0) {
            console.log("Step 4");
            if (isIP(srv[0].name) > 0) {
                return { address: `${srv[0].name}:${srv[0].port}`, host_header: server };
            } else {
                const result_v4 = await this.resolver.resolve(srv[0].name, "A");
                if (result_v4.length > 0) {
                    return { address: `${result_v4[0]}:${srv[0].port}`, host_header: server };
                }

                const result_v6 = await this.resolver.resolve(srv[0].name, "AAAA");
                if (result_v6.length > 0) {
                    return { address: `[${result_v6[0]}]:${srv[0].port}`, host_header: server };
                }
                throw new Error("Unable to resolve the server");
            }
        } else {
            console.log("Step 5");
            // Step 5
            const result_v4 = await this.resolver.resolve(server, "A");
            if (result_v4.length > 0) {
                return { address: `${result_v4[0]}:8448`, host_header: server };
            }

            const result_v6 = await this.resolver.resolve(server, "AAAA");
            if (result_v6.length > 0) {
                return { address: `[${result_v6[0]}]:8448`, host_header: server };
            }

            throw new Error("Unable to resolve the server");
        }
    }

    public async verify(mxid: string, openidToken: string): Promise<boolean> {
        try {
            const server_address = await this.lookup(mxid.slice(mxid.indexOf(":") + 1));
            const resp = await fetch(`https://${server_address.address}/_matrix/federation/v1/openid/userinfo?access_token=${openidToken}`, { method: "GET", headers: { "Host": server_address.host_header } });
            if (resp.status === 200) {
                const data: OpenIDResp = await resp.json();
                return (data.sub === mxid);
            } else {
                return false;
            }
        } catch (error: any) {
            console.error(error);
            return false;
        }
    }
}