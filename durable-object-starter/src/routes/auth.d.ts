export declare const register: import("hono/hono-base").HonoBase<{
    Bindings: Env;
}, {
    "/": {
        $post: {
            input: {
                json: {
                    name: string;
                    email: string;
                    password: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    name: string;
                    email: string;
                    password: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                json: {
                    name: string;
                    email: string;
                    password: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
export declare const login: import("hono/hono-base").HonoBase<{
    Bindings: Env;
}, {
    "/": {
        $post: {
            input: {
                json: {
                    email: string;
                    password: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                json: {
                    email: string;
                    password: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 404;
        } | {
            input: {
                json: {
                    email: string;
                    password: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    email: string;
                    password: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
export declare const me: import("hono/hono-base").HonoBase<{
    Bindings: Env;
}, {
    "/": {
        $get: {
            input: {};
            output: null;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {};
            output: {
                id: number;
                name: string | null;
                email: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
export declare const logout: import("hono/hono-base").HonoBase<{
    Bindings: Env;
}, {
    "/": {
        $post: {
            input: {};
            output: {
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
