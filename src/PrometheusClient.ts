import * as client from "prom-client";

export type PrometheusClient = typeof client;
let initialized = false;

export function createPrometheusClient(): PrometheusClient {
  if (!initialized) {
    client.collectDefaultMetrics();
    initialized = true;
  }
  return client;
}
