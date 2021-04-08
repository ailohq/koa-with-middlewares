declare module "koa-bearer-token" {
  import { Middleware } from "koa";

  interface Options {
    queryKey?: string;
    bodyKey?: string;
    headerKey?: string;
    reqKey?: string;
  }

  export default function tokenParser(options?: Options): Middleware;
}
