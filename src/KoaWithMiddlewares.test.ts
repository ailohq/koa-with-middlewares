import { TestLoggerFactory } from "@ailo/logger";
import { SentryMonitoring } from "@ailo/monitoring";
import { Server } from "http";
import supertest from "supertest";
import {
  KoaWithMiddlewares,
  KoaWithMiddlewaresOptions,
} from "./KoaWithMiddlewares";

// eslint-disable-next-line @typescript-eslint/naming-convention
let _server: Server;
function setup(opts?: Partial<KoaWithMiddlewaresOptions>) {
  const loggerFactory = new TestLoggerFactory();
  const app = new KoaWithMiddlewares({
    loggerFactory,
    monitoring: new SentryMonitoring({
      enabled: false,
    }),
    ...opts,
  });
  _server = app.listen();
  return { loggerFactory, server: _server };
}
afterEach(() => {
  _server.close();
});

describe("GET /error-test", () => {
  it("returns 500, prints stacktrace, and logs error to the console", async () => {
    const { loggerFactory, server } = setup();
    const response = await supertest(server).get("/error-test");
    expect(response).toMatchObject({
      status: 500,
      text: expect.stringMatching(
        /Error: Test error\n.*at.+src\/DefaultRouter.ts/
      ),
    });
    expect(loggerFactory.loggers.koa!.logs).toEqual([
      ["info", "--> GET /error-test"],
      [
        "error",
        expect.stringMatching(
          /\[ERROR] GET \/error-test Error: Test error\n.*at.+src\/DefaultRouter.ts/
        ),
      ],
      [
        "info",
        expect.stringMatching(
          /<-- GET \/error-test - status=500 duration=\d+ms/
        ),
      ],
    ]);
  });

  it("if debug option is false, doesn't print stacktrace", async () => {
    const { server } = setup({ debug: false });
    const response = await supertest(server).get("/error-test");
    expect(response).toMatchObject({
      status: 500,
      text: "Test error",
    });
  });
});
