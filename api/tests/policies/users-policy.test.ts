import { describe, test, expect } from "vitest"

import { User } from "@/models"
import { externalOrganizationFactory, userFactory } from "@/tests/factories"

import UsersPolicy from "@/policies/users-policy"

describe("api/src/policies/users-policy.ts", () => {
  describe("UsersPolicy", () => {
    async function buildInternalUser(roles: string[]) {
      return userFactory.create({ roles, isExternal: false })
    }

    async function buildExternalTarget() {
      const externalOrganization = await externalOrganizationFactory.create()
      return userFactory.create({
        isExternal: true,
        externalOrganizationId: externalOrganization.id,
      })
    }

    // System Admin manages everyone; Admin manages internal only; External Admin
    // manages external only; plain User manages nobody. See TK-36.
    const MATRIX = [
      { role: User.Roles.SYSTEM_ADMIN, canManageInternal: true, canManageExternal: true },
      { role: User.Roles.ADMIN, canManageInternal: true, canManageExternal: false },
      { role: User.Roles.EXTERNAL_ADMIN, canManageInternal: false, canManageExternal: true },
      { role: User.Roles.USER, canManageInternal: false, canManageExternal: false },
    ]

    describe.each(MATRIX)("when actor has the $role role", ({ role, canManageInternal, canManageExternal }) => {
      test(`#create returns ${canManageInternal} for an internal target`, async () => {
        // Arrange
        const actor = await buildInternalUser([role])
        const target = User.build({ isExternal: false })

        // Act, Assert
        expect(new UsersPolicy(actor, target).create()).toBe(canManageInternal)
      })

      test(`#create returns ${canManageExternal} for an external target`, async () => {
        // Arrange
        const actor = await buildInternalUser([role])
        const target = User.build({ isExternal: true })

        // Act, Assert
        expect(new UsersPolicy(actor, target).create()).toBe(canManageExternal)
      })

      test(`#destroy returns ${canManageInternal} for an internal target`, async () => {
        // Arrange
        const actor = await buildInternalUser([role])
        const target = await buildInternalUser([User.Roles.USER])

        // Act, Assert
        expect(new UsersPolicy(actor, target).destroy()).toBe(canManageInternal)
      })

      test(`#destroy returns ${canManageExternal} for an external target`, async () => {
        // Arrange
        const actor = await buildInternalUser([role])
        const target = await buildExternalTarget()

        // Act, Assert
        expect(new UsersPolicy(actor, target).destroy()).toBe(canManageExternal)
      })

      test(`#permittedAttributes ${canManageInternal ? "includes" : "excludes"} roles for an internal target`, async () => {
        // Arrange
        const actor = await buildInternalUser([role])
        const target = await buildInternalUser([User.Roles.USER])

        // Act
        const attributes = new UsersPolicy(actor, target).permittedAttributes()

        // Assert
        expect(attributes.includes("roles")).toBe(canManageInternal)
        expect(attributes.includes("email")).toBe(canManageInternal)
      })
    })

    describe("#update", () => {
      test("when actor is the target, returns true even without an admin role", async () => {
        // Arrange
        const actor = await buildInternalUser([User.Roles.USER])

        // Act, Assert
        expect(new UsersPolicy(actor, actor).update()).toBe(true)
      })

      test("when actor is an external admin and target is internal, returns false", async () => {
        // Arrange
        const actor = await buildInternalUser([User.Roles.EXTERNAL_ADMIN])
        const target = await buildInternalUser([User.Roles.USER])

        // Act, Assert
        expect(new UsersPolicy(actor, target).update()).toBe(false)
      })
    })

    describe(".policyScope", () => {
      test("when actor is a plain internal user, excludes deactivated users", async () => {
        // Arrange
        const actor = await buildInternalUser([User.Roles.USER])
        const active = await buildInternalUser([User.Roles.USER])
        const deactivated = await userFactory.create({
          isExternal: false,
          deactivatedAt: new Date(),
          deactivationReason: "Left the organization",
        })

        // Act
        const scoped = UsersPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((user) => user.id)
        expect(ids).toContain(actor.id)
        expect(ids).toContain(active.id)
        expect(ids).not.toContain(deactivated.id)
      })

      // An external user must never enumerate another First Nation's people. See TK-24.
      test("when actor is external, excludes users from other external organizations", async () => {
        // Arrange
        const ownOrganization = await externalOrganizationFactory.create()
        const otherOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: ownOrganization.id,
        })
        const sameOrganizationPeer = await userFactory.create({
          isExternal: true,
          externalOrganizationId: ownOrganization.id,
        })
        const otherOrganizationUser = await userFactory.create({
          isExternal: true,
          externalOrganizationId: otherOrganization.id,
        })
        const internalUser = await buildInternalUser([User.Roles.USER])

        // Act
        const scoped = UsersPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((user) => user.id)
        expect(ids).toContain(sameOrganizationPeer.id)
        expect(ids).toContain(internalUser.id)
        expect(ids).not.toContain(otherOrganizationUser.id)
      })

      test("when actor is a system admin, returns deactivated users too", async () => {
        // Arrange
        const actor = await buildInternalUser([User.Roles.SYSTEM_ADMIN])
        const deactivated = await userFactory.create({
          isExternal: false,
          deactivatedAt: new Date(),
          deactivationReason: "Left the organization",
        })

        // Act
        const scoped = UsersPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((user) => user.id)
        expect(ids).toContain(deactivated.id)
      })
    })

    describe("#canGrantRole", () => {
      test("when actor is a system admin, may grant system admin", async () => {
        // Arrange
        const actor = await buildInternalUser([User.Roles.SYSTEM_ADMIN])

        // Act, Assert
        expect(actor.canGrantRole(User.Roles.SYSTEM_ADMIN)).toBe(true)
      })

      test("when actor is an admin, may grant admin but not system admin", async () => {
        // Arrange
        const actor = await buildInternalUser([User.Roles.ADMIN])

        // Act, Assert
        expect(actor.canGrantRole(User.Roles.ADMIN)).toBe(true)
        expect(actor.canGrantRole(User.Roles.SYSTEM_ADMIN)).toBe(false)
      })
    })
  })
})
