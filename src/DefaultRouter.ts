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

    this.get("/metrics", async (ctx) => {
      ctx.type = prometheus.register.contentType;
      ctx.body = await prometheus.register.metrics();
    });
  }
}
