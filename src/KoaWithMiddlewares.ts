import { koaLoggerMiddleware } from "@ailo/koa-logger-middleware";
import { applyKoaSentryMiddleware } from "@ailo/koa-sentry-middleware";
import { LoggerFactoryInterface } from "@ailo/logger";
import { SentryMonitoring } from "@ailo/monitoring";
import koaCorsMiddleware from "@koa/cors";
import Koa from "koa";
import tokenParser from "koa-bearer-token";
import bodyParser from "koa-bodyparser";
import { DefaultRouter } from "./DefaultRouter";
import { getErrorHttpStatus } from "./getErrorHttpStatus";
import { createPrometheusClient } from "./PrometheusClient";

export interface KoaWithMiddlewaresOptions {
  /**
   * If true, error stacktraces will be printed in the HTTP response.
   *
   * @default process.env.NODE_ENV !== "production"
   */
  debug?: boolean;
  /**
   * @default true
   */
  cors?: boolean;
  loggerFactory: Pick<LoggerFactoryInterface, "logAs">;
  monitoring?: SentryMonitoring;
}

export class KoaWithMiddlewares extends Koa {
  constructor({
    debug = process.env.NODE_ENV !== "production",
    cors = true,
    loggerFactory,
    monitoring,
  }: KoaWithMiddlewaresOptions) {
    super();

    this.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        ctx.status = getErrorHttpStatus(error);
        ctx.body =
          (debug ? error.stack : undefined) || error.message || `${error}`;
        ctx.app.emit("error", error, ctx);
      }
    });

    this.use(
      koaLoggerMiddleware({
        logger: loggerFactory.logAs("koa"),
      })
    );
    if (monitoring) {
      applyKoaSentryMiddleware(this, { monitoring });
    }

    if (cors) {
      this.use(koaCorsMiddleware());
    }

    this.use(bodyParser());
    this.use(tokenParser());

    const router = new DefaultRouter({ prometheus: createPrometheusClient() });
    this.use(router.routes());
  }
}
