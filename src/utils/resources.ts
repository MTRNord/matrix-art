// A Resource is an object with a read method returning the payload
export interface Resource<Payload> {
    read: () => Payload;
}

export type status = "pending" | "success" | "error";

// this function let us get a new function using the asyncFn we pass
// this function also receives a payload and return us a resource with
// that payload assigned as type
export function createResource<Payload>(
    asyncFn: () => Promise<Payload>
): Resource<Payload> {
    // we start defining our resource is on a pending status
    let status: status = "pending";
    // and we create a variable to store the result
    let result: any;
    // then we immediately start running the `asyncFn` function
    // and we store the resulting promise
    const promise = asyncFn().then(
        (r: Payload) => {
            // once it's fulfilled we change the status to success
            // and we save the returned value as result
            status = "success";
            result = r;
        },
        (e: Error) => {
            // once it's rejected we change the status to error
            // and we save the returned error as result
            status = "error";
            result = e;
        }
    );
    // lately we return an error object with the read method
    return {
        read(): Payload {
            // here we will check the status value
            switch (status) {
                case "pending":
                    // if it's still pending we throw the promise
                    // throwing a promise is how Suspense know our component is not ready
                    throw promise;
                case "error":
                    // if it's error we throw the error
                    throw result;
                case "success":
                    // if it's success we return the result
                    return result;
            }
        },
    };
}