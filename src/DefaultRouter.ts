import Router from "koa-router";
import { PrometheusClient } from "./PrometheusClient";

export class DefaultRouter extends Router {
  constructor({ prometheus }: { prometheus: PrometheusClient }) {
    super();

    this.get("/ping", (ctx) => {
      ctx.body = "pong";
    });

    this.get("/error-test", () => {
      throw new Error(`Test error`);
    });

    this.get("/metrics", (ctx) => {
      ctx.type = prometheus.register.contentType;
      ctx.body = prometheus.register.metrics();
    });
  }
}
