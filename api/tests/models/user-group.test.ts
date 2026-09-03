import { describe, test, expect } from "vitest"

import { UserGroup } from "@/models"
import { externalOrganizationFactory, groupFactory, userFactory } from "@/tests/factories"

describe("api/src/models/user-group.ts", () => {
  describe("UserGroup", () => {
    describe("#ensureUserGroupTypeConsistency", () => {
      test("when an internal user joins an internal group, succeeds", async () => {
        // Arrange
        const user = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        const creator = await userFactory.create()

        // Act, Assert
        await expect(
          UserGroup.create({ userId: user.id, groupId: group.id, creatorId: creator.id })
        ).resolves.toBeDefined()
      })

      test("when an external user joins an external group, succeeds", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const user = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const group = await groupFactory.create({ isExternal: true })
        const creator = await userFactory.create()

        // Act, Assert
        await expect(
          UserGroup.create({ userId: user.id, groupId: group.id, creatorId: creator.id })
        ).resolves.toBeDefined()
      })

      // Internal Group Admins can add internal users and not External Users: an internal
      // group has no seat for an external user to begin with.
      test("when an external user is added to an internal group, throws", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const user = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const group = await groupFactory.create({ isExternal: false })
        const creator = await userFactory.create()

        // Act, Assert
        await expect(
          UserGroup.create({ userId: user.id, groupId: group.id, creatorId: creator.id })
        ).rejects.toThrow()
      })

      // External Group Admins can add only external users: an external group has no seat
      // for an internal user.
      test("when an internal user is added to an external group, throws", async () => {
        // Arrange
        const user = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: true })
        const creator = await userFactory.create()

        // Act, Assert
        await expect(
          UserGroup.create({ userId: user.id, groupId: group.id, creatorId: creator.id })
        ).rejects.toThrow()
      })
    })
  })
})
