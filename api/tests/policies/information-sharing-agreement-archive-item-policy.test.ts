import { describe, test, expect } from "vitest"

import { InformationSharingAgreement } from "@/models"
import {
  archiveItemFactory,
  groupFactory,
  informationSharingAgreementArchiveItemFactory,
  informationSharingAgreementFactory,
  informationSharingAgreementAccessGrantFactory,
  userFactory,
} from "@/tests/factories"

import InformationSharingAgreementArchiveItemPolicy from "@/policies/information-sharing-agreement-archive-item-policy"

describe("api/src/policies/information-sharing-agreement-archive-item-policy.ts", () => {
  describe("InformationSharingAgreementArchiveItemPolicy", () => {
    describe(".applyScope", () => {
      /**
       * TK-24 widened agreement visibility to every internal Yukon Government employee.
       * This asserts the Traditional Knowledge shared under those agreements did NOT
       * widen with it: without an access grant, the link rows must stay invisible.
       */
      test("given an internal user who can see the agreement but has no access grant, returns nothing", async () => {
        // Arrange
        const internalUser = await userFactory.create({ isExternal: false })
        const owner = await userFactory.create({ isExternal: false })
        const internalGroup = await groupFactory.create({ isExternal: false })

        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: owner.id,
          status: InformationSharingAgreement.Status.SIGNED,
          internalGroupId: internalGroup.id,
        })
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        await informationSharingAgreementArchiveItemFactory.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          archiveItemId: archiveItem.id,
          creatorId: owner.id,
        })

        // Act
        const scoped = InformationSharingAgreementArchiveItemPolicy.applyScope([], internalUser)

        // Assert
        const results = await scoped.findAll()
        expect(results).toEqual([])
      })

      test("given a user with an access grant for the knowledge item, returns the link", async () => {
        // Arrange
        const grantee = await userFactory.create({ isExternal: false })
        const owner = await userFactory.create({ isExternal: false })
        const internalGroup = await groupFactory.create({ isExternal: false })

        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: owner.id,
          status: InformationSharingAgreement.Status.SIGNED,
          internalGroupId: internalGroup.id,
        })
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        const link = await informationSharingAgreementArchiveItemFactory.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          archiveItemId: archiveItem.id,
          creatorId: owner.id,
        })
        await informationSharingAgreementAccessGrantFactory.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          groupId: internalGroup.id,
          userId: grantee.id,
          creatorId: owner.id,
        })

        // Act
        const scoped = InformationSharingAgreementArchiveItemPolicy.applyScope([], grantee)

        // Assert
        const results = await scoped.findAll()
        expect(results).toEqual([expect.objectContaining({ id: link.id })])
      })

      test("given the owner of the knowledge item, returns the link", async () => {
        // Arrange
        const owner = await userFactory.create({ isExternal: false })
        const internalGroup = await groupFactory.create({ isExternal: false })

        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: owner.id,
          status: InformationSharingAgreement.Status.SIGNED,
          internalGroupId: internalGroup.id,
        })
        const archiveItem = await archiveItemFactory.create({ userId: owner.id })
        const link = await informationSharingAgreementArchiveItemFactory.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          archiveItemId: archiveItem.id,
          creatorId: owner.id,
        })

        // Act
        const scoped = InformationSharingAgreementArchiveItemPolicy.applyScope([], owner)

        // Assert
        const results = await scoped.findAll()
        expect(results).toEqual([expect.objectContaining({ id: link.id })])
      })
    })
  })
})
