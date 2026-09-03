import { describe, test, expect } from "vitest"

import {
  ArchiveItem,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  User,
} from "@/models"
import {
  archiveItemFactory,
  externalOrganizationFactory,
  groupFactory,
  informationSharingAgreementAccessGrantFactory,
  informationSharingAgreementArchiveItemFactory,
  informationSharingAgreementFactory,
  userFactory,
} from "@/tests/factories"

import ArchiveItemsPolicy from "@/policies/archive-items-policy"

describe("api/src/policies/archive-items-policy.ts", () => {
  describe("ArchiveItemsPolicy", () => {
    async function grantAccess(
      archiveItem: ArchiveItem,
      userId: number,
      accessLevel: (typeof InformationSharingAgreementAccessGrant.AccessLevels)[keyof typeof InformationSharingAgreementAccessGrant.AccessLevels]
    ) {
      const group = await groupFactory.create({ isExternal: false })
      const informationSharingAgreement = await informationSharingAgreementFactory.create({
        status: InformationSharingAgreement.Status.SIGNED,
        internalGroupId: group.id,
      })
      await informationSharingAgreementArchiveItemFactory.create({
        informationSharingAgreementId: informationSharingAgreement.id,
        archiveItemId: archiveItem.id,
      })
      await informationSharingAgreementAccessGrantFactory.create({
        informationSharingAgreementId: informationSharingAgreement.id,
        groupId: group.id,
        userId,
        accessLevel,
      })
      await archiveItem.reload({ include: ["accessGrants"] })
    }

    describe("#create", () => {
      test("when actor is internal, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const archiveItem = ArchiveItem.build()

        // Act, Assert
        expect(new ArchiveItemsPolicy(actor, archiveItem).create()).toBe(true)
      })

      // External Users cannot create ISAs or Knowledge Items.
      test("when actor is external, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const archiveItem = ArchiveItem.build()

        // Act, Assert
        expect(new ArchiveItemsPolicy(actor, archiveItem).create()).toBe(false)
      })
    })

    describe("#show", () => {
      test("when actor is the owner, returns true", async () => {
        // Arrange
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await archiveItem.reload({ include: ["accessGrants"] })

        // Act, Assert
        expect(new ArchiveItemsPolicy(owner, archiveItem).show()).toBe(true)
      })

      // Respective Knowledge Items are visible only to ISA Group Members.
      test("when actor has an access grant on the item's agreement, returns true", async () => {
        // Arrange
        const grantee = await userFactory.create()
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await grantAccess(
          archiveItem,
          grantee.id,
          InformationSharingAgreementAccessGrant.AccessLevels.READ
        )

        // Act, Assert
        expect(new ArchiveItemsPolicy(grantee, archiveItem).show()).toBe(true)
      })

      // If a user is not part of the ISA Group, they should not be able to open any
      // Knowledge Item from the ISA.
      test("when actor is not the owner and has no access grant, returns false", async () => {
        // Arrange
        const stranger = await userFactory.create()
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await archiveItem.reload({ include: ["accessGrants"] })

        // Act, Assert
        expect(new ArchiveItemsPolicy(stranger, archiveItem).show()).toBe(false)
      })

      // Not even Sys Admins should be allowed to view the knowledge if they are not part
      // of the ISA Group -- and the internal/external admin roles govern user
      // administration, not ISA Group membership, so they must not act as a bypass either.
      test("when actor holds the internal admin role but has no access grant, returns false", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await archiveItem.reload({ include: ["accessGrants"] })

        // Act, Assert
        expect(new ArchiveItemsPolicy(admin, archiveItem).show()).toBe(false)
      })

      test("when actor holds the external admin role but has no access grant, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const admin = await userFactory.create({
          roles: [User.Roles.EXTERNAL_ADMIN],
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await archiveItem.reload({ include: ["accessGrants"] })

        // Act, Assert
        expect(new ArchiveItemsPolicy(admin, archiveItem).show()).toBe(false)
      })

      // Sys Admins should be allowed to view the knowledge if they are not part of the
      // ISA Group. Distinct from ADMIN/EXTERNAL_ADMIN above: only SYSTEM_ADMIN bypasses.
      test("when actor is a system admin with no access grant, returns true", async () => {
        // Arrange
        const systemAdmin = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await archiveItem.reload({ include: ["accessGrants"] })

        // Act, Assert
        expect(new ArchiveItemsPolicy(systemAdmin, archiveItem).show()).toBe(true)
      })
    })

    describe("#update", () => {
      test("when actor is the owner, returns true", async () => {
        // Arrange
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await archiveItem.reload({ include: ["accessGrants"] })

        // Act, Assert
        expect(new ArchiveItemsPolicy(owner, archiveItem).update()).toBe(true)
      })

      // Only Group Admins can add attachments to Knowledge Items. Admin-level ISA access
      // is what makes someone a Group Admin for this agreement's Knowledge Items.
      test("when actor has an admin-level access grant, returns true", async () => {
        // Arrange
        const admin = await userFactory.create({ isExternal: false })
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await grantAccess(
          archiveItem,
          admin.id,
          InformationSharingAgreementAccessGrant.AccessLevels.ADMIN
        )

        // Act, Assert
        expect(new ArchiveItemsPolicy(admin, archiveItem).update()).toBe(true)
      })

      // External Group Admins can attach files: access level, not internal/external
      // status, is what grants the ability.
      test("when actor is external with an admin-level access grant, returns true", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const admin = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await grantAccess(
          archiveItem,
          admin.id,
          InformationSharingAgreementAccessGrant.AccessLevels.ADMIN
        )

        // Act, Assert
        expect(new ArchiveItemsPolicy(admin, archiveItem).update()).toBe(true)
      })

      test("when actor has only a read-level access grant, returns false", async () => {
        // Arrange
        const reader = await userFactory.create()
        const owner = await userFactory.create()
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await grantAccess(
          archiveItem,
          reader.id,
          InformationSharingAgreementAccessGrant.AccessLevels.READ
        )

        // Act, Assert
        expect(new ArchiveItemsPolicy(reader, archiveItem).update()).toBe(false)
      })
    })
  })
})
