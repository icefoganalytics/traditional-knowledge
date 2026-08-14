import { User } from "@/models"

import {
  externalOrganizationFactory,
  groupFactory,
  informationSharingAgreementFactory,
  userFactory,
  userGroupFactory,
} from "@/tests/factories"

import SignedStatePolicy from "@/policies/information-sharing-agreements/signed-state-policy"

describe("api/src/policies/information-sharing-agreements/signed-state-policy.ts", () => {
  describe("SignedStatePolicy", () => {
    describe("#show", () => {
      test("when user is the creator, returns true", async () => {
        // Arrange
        const user1 = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user1.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.show()).toBe(true)
      })

      test("when user is system admin, returns true", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.SYSTEM_ADMIN],
        })
        const user2 = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user2.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.show()).toBe(true)
      })

      test("when user is member of internal group, returns true", async () => {
        // Arrange
        const user1 = await userFactory.create()
        const user2 = await userFactory.create()
        const internalGroup = await groupFactory.create({ isExternal: false })
        await userGroupFactory.create({
          userId: user1.id,
          groupId: internalGroup.id,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user2.id,
          internalGroupId: internalGroup.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.show()).toBe(true)
      })

      test("when user is member of external group, returns true", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const user1 = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const user2 = await userFactory.create()
        const externalGroup = await groupFactory.create({ isExternal: true })
        await userGroupFactory.create({
          userId: user1.id,
          groupId: externalGroup.id,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user2.id,
          externalGroupId: externalGroup.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.show()).toBe(true)
      })

      // Agreement metadata is readable by every internal employee; the Traditional
      // Knowledge shared under it stays restricted. See TK-24.
      test("when user is internal but not a member of any group, returns true", async () => {
        // Arrange
        const user1 = await userFactory.create({ isExternal: false })
        const user2 = await userFactory.create()
        const internalGroup = await groupFactory.create({ isExternal: false })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user2.id,
          internalGroupId: internalGroup.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.show()).toBe(true)
      })

      test("when user is external and not a member of the external group, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const externalUser = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const creator = await userFactory.create()
        const externalGroup = await groupFactory.create({ isExternal: true })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: creator.id,
          externalGroupId: externalGroup.id,
        })

        await externalUser.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(externalUser, informationSharingAgreement)

        // Assert
        expect(policy.show()).toBe(false)
      })
    })

    describe("#update", () => {
      test("returns false for all users", async () => {
        // Arrange
        const user1 = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user1.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.update()).toBe(false)
      })
    })

    describe("#destroy", () => {
      test("returns false for all users", async () => {
        // Arrange
        const user1 = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: user1.id,
        })

        await user1.reload({ include: ["groups", "adminGroups"] })

        // Act
        const policy = new SignedStatePolicy(user1, informationSharingAgreement)

        // Assert
        expect(policy.destroy()).toBe(false)
      })
    })
  })
})
