import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { auth } from ".";
import { createGlobalLogger } from "logger";
import { config } from "dotenv";
import db from "prisma";

config();

const testLogger = createGlobalLogger(
  "AuthTestLogger",
  process.env.TEST_LOG !== "true"
);

const adminUsername = "TEST_ADMIN_USERNAME";
const adminPassword = "TEST_ADMIN_PASSWORD";

beforeAll(async () => {
  process.env["ADMIN_USERNAME"] = adminUsername;
  process.env["ADMIN_PASSWORD"] = adminPassword;
});
beforeEach(async () => {
  await db.session.deleteMany();
});

describe("Admin", () => {
  describe("validateAdminInfo", () => {
    test("Invalid username, password", async () => {
      expect(
        (
          await auth.validateAdminInfo(testLogger, {
            username: "invalid",
            password: "invalid",
          })
        ).valid
      ).toBeFalse();
    });

    test("Invalid username", async () => {
      expect(
        (
          await auth.validateAdminInfo(testLogger, {
            username: "invalid",
            password: adminPassword,
          })
        ).valid
      ).toBeFalse();
    });

    test("Invalid password", async () => {
      expect(
        (
          await auth.validateAdminInfo(testLogger, {
            username: adminUsername,
            password: "invalid",
          })
        ).valid
      ).toBeFalse();
    });

    test("All valid", async () => {
      expect(
        (
          await auth.validateAdminInfo(testLogger, {
            username: adminUsername,
            password: adminPassword,
          })
        ).valid
      ).toBeTrue();
    });
  });
});

describe("Session", () => {
  describe("createSession", () => {
    test("Session creation", async () => {
      await auth.createSession(testLogger);
      expect((await db.session.findFirst())?.id).toBeTruthy();
    });
  });
  describe("checkSession", () => {
    test("Check valid session", async () => {
      const newSession = await db.session.create({ data: {} });

      expect(
        (await auth.checkSession(testLogger, { sessionId: newSession.id }))
          .valid
      ).toBeTrue();
    });
    test("Check invalid session", async () => {
      await db.session.create({ data: {} });

      expect(
        (await auth.checkSession(testLogger, { sessionId: "invalid" })).valid
      ).toBeFalse();
    });
  });
  describe("destroyAllSession", () => {
    test("Destroy when single session", async () => {
      await db.session.create({ data: {} });

      await auth.destroyAllSession(testLogger);

      expect(await db.session.count()).toBe(0);
    });
    test("Destroy when many session", async () => {
      await db.session.createMany({ data: [{}, {}, {}] });
      await auth.destroyAllSession(testLogger);
      expect(await db.session.count()).toBe(0);
    });
  });
});
