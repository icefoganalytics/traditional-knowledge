import { describe, test, expect } from "vitest"

import { User, UserGroup } from "@/models"
import {
  externalOrganizationFactory,
  groupFactory,
  userFactory,
  userGroupFactory,
} from "@/tests/factories"

import UserGroupPolicy from "@/policies/user-group-policy"

describe("api/src/policies/user-group-policy.ts", () => {
  describe("UserGroupPolicy", () => {
    describe("#create", () => {
      // System Admins can add any user to any group.
      test("when actor is a system admin, returns true regardless of group", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        await actor.reload({ include: ["adminGroups"] })
        const group = await groupFactory.create({ isExternal: false })
        const record = UserGroup.build({ groupId: group.id, userId: actor.id, creatorId: actor.id })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).create()).toBe(true)
      })

      // Internal Group Admins can add internal users to their groups.
      test("when actor is an internal group admin of the target group, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({ groupId: group.id, userId: actor.id, creatorId: actor.id })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).create()).toBe(true)
      })

      test("when actor is an internal group admin of a different group, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const ownGroup = await groupFactory.create({ isExternal: false })
        const otherGroup = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: ownGroup.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({
          groupId: otherGroup.id,
          userId: actor.id,
          creatorId: actor.id,
        })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).create()).toBe(false)
      })

      // External Group Admins can add only external users to their own First Nation group.
      test("when actor is an external group admin of the target group, returns true", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const group = await groupFactory.create({ isExternal: true })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({ groupId: group.id, userId: actor.id, creatorId: actor.id })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).create()).toBe(true)
      })

      // External Group Admins can only view/manage their own First Nation group, not
      // other FN groups.
      test("when actor is an external group admin of a different First Nation group, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const ownGroup = await groupFactory.create({ isExternal: true })
        const otherGroup = await groupFactory.create({ isExternal: true })
        await userGroupFactory.create({ userId: actor.id, groupId: ownGroup.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({
          groupId: otherGroup.id,
          userId: actor.id,
          creatorId: actor.id,
        })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).create()).toBe(false)
      })

      test("when actor is a plain member of the group, not an admin, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: false })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({ groupId: group.id, userId: actor.id, creatorId: actor.id })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).create()).toBe(false)
      })
    })

    describe("#update", () => {
      test("when actor is admin of the group, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({ groupId: group.id, userId: actor.id, creatorId: actor.id })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).update()).toBe(true)
      })
    })

    describe("#destroy", () => {
      test("when actor is admin of the group, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })
        const record = UserGroup.build({ groupId: group.id, userId: actor.id, creatorId: actor.id })

        // Act, Assert
        expect(new UserGroupPolicy(actor, record).destroy()).toBe(true)
      })
    })
  })
})
