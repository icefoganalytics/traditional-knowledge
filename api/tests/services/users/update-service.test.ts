import { User } from "@/models"

import { userFactory } from "@/tests/factories"

import UpdateService from "@/services/users/update-service"

describe("api/src/services/users/update-service.ts", () => {
  describe("UpdateService", () => {
    describe("#perform", () => {
      test("when currentUser is an admin and grants the admin role, succeeds", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const target = await userFactory.create({ roles: [User.Roles.USER] })

        // Act
        const updatedUser = await UpdateService.perform(
          target,
          { roles: [User.Roles.USER, User.Roles.ADMIN] },
          currentUser
        )

        // Assert
        expect(updatedUser.roles).toContain(User.Roles.ADMIN)
      })

      // An admin must never be able to hand out system admin, to themselves or anyone
      // else, by crafting a request the UI would not offer. See TK-36.
      test("when currentUser is an admin and attempts to grant system admin, throws", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const target = await userFactory.create({ roles: [User.Roles.USER] })

        // Act, Assert
        await expect(
          UpdateService.perform(
            target,
            { roles: [User.Roles.USER, User.Roles.SYSTEM_ADMIN] },
            currentUser
          )
        ).rejects.toThrow("You are not authorized to grant the system_admin role")

        await target.reload()
        expect(target.roles).not.toContain(User.Roles.SYSTEM_ADMIN)
      })

      test("when currentUser is a system admin and grants system admin, succeeds", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const target = await userFactory.create({ roles: [User.Roles.USER] })

        // Act
        const updatedUser = await UpdateService.perform(
          target,
          { roles: [User.Roles.USER, User.Roles.SYSTEM_ADMIN] },
          currentUser
        )

        // Assert
        expect(updatedUser.roles).toContain(User.Roles.SYSTEM_ADMIN)
      })

      test("when attributes do not include roles, does not check grantability", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
        const target = await userFactory.create({ roles: [User.Roles.USER] })

        // Act
        const updatedUser = await UpdateService.perform(
          target,
          { title: "Updated Title" },
          currentUser
        )

        // Assert
        expect(updatedUser.title).toBe("Updated Title")
      })
    })
  })
})
