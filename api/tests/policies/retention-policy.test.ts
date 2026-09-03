import { describe, test, expect } from "vitest"

import { Retention, User } from "@/models"
import { externalOrganizationFactory, userFactory } from "@/tests/factories"

import RetentionPolicy from "@/policies/retention-policy"

describe("api/src/policies/retention-policy.ts", () => {
  describe("RetentionPolicy", () => {
    function buildRetention() {
      return Retention.build({
        name: "Test Retention",
        isDefault: false,
        expireSchedule: "* 1 * * *",
        expireAction: "Destroy",
      })
    }

    describe("#show", () => {
      test("when actor is internal, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const retention = buildRetention()

        // Act, Assert
        expect(new RetentionPolicy(actor, retention).show()).toBe(true)
      })

      // Everything from the Administration Dashboard is blocked for External Users
      // except Users and Groups.
      test("when actor is external, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const retention = buildRetention()

        // Act, Assert
        expect(new RetentionPolicy(actor, retention).show()).toBe(false)
      })
    })

    describe("#create", () => {
      test("when actor is a system admin, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const retention = buildRetention()

        // Act, Assert
        expect(new RetentionPolicy(actor, retention).create()).toBe(true)
      })

      test("when actor is not a system admin, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const retention = buildRetention()

        // Act, Assert
        expect(new RetentionPolicy(actor, retention).create()).toBe(false)
      })
    })

    describe(".policyScope", () => {
      test("when actor is internal, returns every retention", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const retention = await Retention.create({
          name: "Test Retention",
          isDefault: false,
          expireSchedule: "* 1 * * *",
          expireAction: "Destroy",
        })

        // Act
        const scoped = RetentionPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((record) => record.id)
        expect(ids).toContain(retention.id)
      })

      test("when actor is external, returns no retentions", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        await Retention.create({
          name: "Test Retention",
          isDefault: false,
          expireSchedule: "* 1 * * *",
          expireAction: "Destroy",
        })

        // Act
        const scoped = RetentionPolicy.applyScope([], actor)

        // Assert
        const records = await scoped.findAll()
        expect(records).toEqual([])
      })
    })
  })
})
