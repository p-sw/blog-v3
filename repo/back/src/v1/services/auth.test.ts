import { describe, expect, test } from "bun:test";
import { auth } from ".";
import { createGlobalLogger } from "logger";
import { config } from "dotenv";
import db from "prisma";

const testLogger = createGlobalLogger("AuthTestLogger");

config();

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminUsername || !adminPassword) throw new Error("admin info not set");

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
      try {
        await auth.createSession(testLogger);
        expect((await db.session.findFirst())?.id).toBeTruthy();
      } finally {
        await db.session.deleteMany();
      }
    });
  });
  describe("checkSession", () => {
    test("Check valid session", async () => {
      try {
        const newSession = await db.session.create({ data: {} });

        expect(
          (await auth.checkSession(testLogger, { sessionId: newSession.id }))
            .valid
        ).toBeTrue();
      } finally {
        await db.session.deleteMany();
      }
    });
    test("Check invalid session", async () => {
      try {
        await db.session.create({ data: {} });

        expect(
          (await auth.checkSession(testLogger, { sessionId: "invalid" })).valid
        ).toBeFalse();
      } finally {
        await db.session.deleteMany();
      }
    });
  });
  describe("destroyAllSession", () => {
    test("Destroy when single session", async () => {
      try {
        await db.session.create({ data: {} });

        await auth.destroyAllSession(testLogger);

        expect(await db.session.count()).toBe(0);
      } finally {
        await db.session.deleteMany();
      }
    });
    test("Destroy when many session", async () => {
      try {
        await db.session.createMany({ data: [{}, {}, {}] });
        await auth.destroyAllSession(testLogger);
        expect(await db.session.count()).toBe(0);
      } finally {
        await db.session.deleteMany();
      }
    });
  });
});
