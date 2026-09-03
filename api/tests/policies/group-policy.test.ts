import { describe, test, expect } from "vitest"

import { Group, User } from "@/models"
import {
  externalOrganizationFactory,
  groupFactory,
  userFactory,
  userGroupFactory,
} from "@/tests/factories"

import GroupPolicy from "@/policies/group-policy"

describe("api/src/policies/group-policy.ts", () => {
  describe("GroupPolicy", () => {
    describe("#show", () => {
      test("when actor is a system admin, returns true for any group", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const group = await groupFactory.create({ isExternal: true })

        // Act, Assert
        expect(new GroupPolicy(actor, group).show()).toBe(true)
      })

      // Internal Group Admins can add internal users to their groups but can view other
      // groups.
      test("when actor is internal, returns true even for a group they are not a member of", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const otherInternalGroup = await groupFactory.create({ isExternal: false })

        // Act, Assert
        expect(new GroupPolicy(actor, otherInternalGroup).show()).toBe(true)
      })

      test("when actor is external and a member of the group, returns true", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const ownGroup = await groupFactory.create({ isExternal: true })
        await userGroupFactory.create({ userId: actor.id, groupId: ownGroup.id })
        await actor.reload({ include: ["groups"] })

        // Act, Assert
        expect(new GroupPolicy(actor, ownGroup).show()).toBe(true)
      })

      // External Group Admins can only view their own First Nation groups, not other FN
      // groups. External Users can only see groups they are part of.
      test("when actor is external and not a member of the group, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const otherExternalGroup = await groupFactory.create({ isExternal: true })
        await actor.reload({ include: ["groups"] })

        // Act, Assert
        expect(new GroupPolicy(actor, otherExternalGroup).show()).toBe(false)
      })
    })

    describe(".policyScope", () => {
      test("when actor is internal, returns every group", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const internalGroup = await groupFactory.create({ isExternal: false })
        const externalGroup = await groupFactory.create({ isExternal: true })

        // Act
        const scoped = GroupPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((group) => group.id)
        expect(ids).toContain(internalGroup.id)
        expect(ids).toContain(externalGroup.id)
      })

      // An external user must never enumerate another First Nation's group.
      test("when actor is external, excludes groups they are not a member of", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const ownGroup = await groupFactory.create({ isExternal: true })
        const otherGroup = await groupFactory.create({ isExternal: true })
        await userGroupFactory.create({ userId: actor.id, groupId: ownGroup.id })

        // Act
        const scoped = GroupPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((group) => group.id)
        expect(ids).toContain(ownGroup.id)
        expect(ids).not.toContain(otherGroup.id)
      })
    })

    describe("#create", () => {
      test("when actor is a system admin, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const group = Group.build({ isExternal: false, name: "Test Group", creatorId: actor.id })

        // Act, Assert
        expect(new GroupPolicy(actor, group).create()).toBe(true)
      })

      test("when actor is a group admin but not a system admin, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = Group.build({ isExternal: false, name: "Test Group", creatorId: actor.id })

        // Act, Assert
        expect(new GroupPolicy(actor, group).create()).toBe(false)
      })
    })

    describe("#update", () => {
      test("when actor is a system admin, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        await actor.reload({ include: ["adminGroups"] })
        const group = await groupFactory.create({ isExternal: false })

        // Act, Assert
        expect(new GroupPolicy(actor, group).update()).toBe(true)
      })

      test("when actor is admin of the group, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })

        // Act, Assert
        expect(new GroupPolicy(actor, group).update()).toBe(true)
      })

      // External Group Admins can only edit their own groups.
      test("when actor is admin of a different group, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const ownGroup = await groupFactory.create({ isExternal: false })
        const otherGroup = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: ownGroup.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })

        // Act, Assert
        expect(new GroupPolicy(actor, otherGroup).update()).toBe(false)
      })
    })

    describe("#destroy", () => {
      test("when actor is a system admin, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const group = await groupFactory.create({ isExternal: false })

        // Act, Assert
        expect(new GroupPolicy(actor, group).destroy()).toBe(true)
      })

      test("when actor is a group admin but not a system admin, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const group = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({ userId: actor.id, groupId: group.id, isAdmin: true })
        await actor.reload({ include: ["adminGroups"] })

        // Act, Assert
        expect(new GroupPolicy(actor, group).destroy()).toBe(false)
      })
    })
  })
})
