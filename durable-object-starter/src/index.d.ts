import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
export declare class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env);
    sayHello(): Promise<string>;
}
declare const app: Hono<{
    Bindings: Env;
}, import("hono/types").BlankSchema, "/">;
declare const routes: import("hono/hono-base").HonoBase<{
    Bindings: Env;
}, ({
    "/hello": {
        $get: {
            input: {};
            output: "hello world";
            outputFormat: "text";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/users": {
        $get: {
            input: {};
            output: {
                id: number;
                name: string | null;
                email: string;
                password: string | null;
            }[];
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}) | import("hono/types").MergeSchemaPath<{
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
}, "/register"> | import("hono/types").MergeSchemaPath<{
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
}, "/login"> | import("hono/types").MergeSchemaPath<{
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
}, "/me"> | import("hono/types").MergeSchemaPath<{
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
}, "/logout">, "/">;
export default app;
export type AppType = typeof routes;
