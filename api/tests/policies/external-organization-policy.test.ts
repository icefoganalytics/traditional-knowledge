import { describe, test, expect } from "vitest"

import { ExternalOrganization, User } from "@/models"
import { externalOrganizationFactory, userFactory } from "@/tests/factories"

import { ExternalOrganizationPolicy } from "@/policies/external-organization-policy"

describe("api/src/policies/external-organization-policy.ts", () => {
  describe("ExternalOrganizationPolicy", () => {
    describe("#show", () => {
      test("when actor is internal, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const externalOrganization = ExternalOrganization.build({ name: "Test Organization" })

        // Act, Assert
        expect(new ExternalOrganizationPolicy(actor, externalOrganization).show()).toBe(true)
      })

      // Everything from the Administration Dashboard is blocked for External Users
      // except Users and Groups.
      test("when actor is external, returns false even for their own organization", async () => {
        // Arrange
        const ownOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: ownOrganization.id,
        })

        // Act, Assert
        expect(new ExternalOrganizationPolicy(actor, ownOrganization).show()).toBe(false)
      })
    })

    describe("#create", () => {
      test("when actor is a system admin, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const externalOrganization = ExternalOrganization.build({ name: "Test Organization" })

        // Act, Assert
        expect(new ExternalOrganizationPolicy(actor, externalOrganization).create()).toBe(true)
      })

      test("when actor is not a system admin, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const externalOrganization = ExternalOrganization.build({ name: "Test Organization" })

        // Act, Assert
        expect(new ExternalOrganizationPolicy(actor, externalOrganization).create()).toBe(false)
      })
    })

    describe(".policyScope", () => {
      test("when actor is internal, returns every external organization", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const externalOrganization = await externalOrganizationFactory.create()

        // Act
        const scoped = ExternalOrganizationPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((record) => record.id)
        expect(ids).toContain(externalOrganization.id)
      })

      test("when actor is external, returns no external organizations", async () => {
        // Arrange
        const ownOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: ownOrganization.id,
        })

        // Act
        const scoped = ExternalOrganizationPolicy.applyScope([], actor)

        // Assert
        const records = await scoped.findAll()
        expect(records).toEqual([])
      })
    })
  })
})
