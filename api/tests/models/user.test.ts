import { describe, test, expect } from "vitest"

import { User } from "@/models"
import { userFactory } from "@/tests/factories"

describe("api/src/models/user.ts", () => {
  describe("User", () => {
    describe("withRole scope", () => {
      // roles is a comma-joined string, so a naive '%admin%' match would also return
      // system_admin and external_admin holders. See TK-36.
      test("when roles share a substring, matches only the exact role", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const _systemAdmin = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const _externalAdmin = await userFactory.create({ roles: [User.Roles.EXTERNAL_ADMIN] })

        // Act
        const users = await User.withScope({ method: ["withRole", User.Roles.ADMIN] }).findAll()

        // Assert
        expect(users).toEqual([expect.objectContaining({ id: admin.id })])
      })

      test("when the role is one of several, still matches", async () => {
        // Arrange
        const multiRoleUser = await userFactory.create({
          roles: [User.Roles.USER, User.Roles.ADMIN, User.Roles.EXTERNAL_ADMIN],
        })

        // Act
        const users = await User.withScope({ method: ["withRole", User.Roles.ADMIN] }).findAll()

        // Assert
        expect(users).toEqual([expect.objectContaining({ id: multiRoleUser.id })])
      })
    })

    describe("#canManageUser", () => {
      test("when actor is a plain user, manages nobody", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.USER] })

        // Act, Assert
        expect(actor.canManageUser(User.build({ isExternal: false }))).toBe(false)
        expect(actor.canManageUser(User.build({ isExternal: true }))).toBe(false)
      })

      test("when actor is an admin, manages internal users only", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.ADMIN] })

        // Act, Assert
        expect(actor.canManageUser(User.build({ isExternal: false }))).toBe(true)
        expect(actor.canManageUser(User.build({ isExternal: true }))).toBe(false)
      })

      test("when actor is an external admin, manages external users only", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.EXTERNAL_ADMIN] })

        // Act, Assert
        expect(actor.canManageUser(User.build({ isExternal: false }))).toBe(false)
        expect(actor.canManageUser(User.build({ isExternal: true }))).toBe(true)
      })
    })
  })
})
