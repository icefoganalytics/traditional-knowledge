import {
  externalOrganizationFactory,
  informationSharingAgreementFactory,
  userFactory,
} from "@/tests/factories"

import CreateService from "@/services/information-sharing-agreements/archive-items/create-service"

describe("api/src/services/information-sharing-agreements/archive-items/create-service.ts", () => {
  describe("CreateService", () => {
    describe("#perform", () => {
      test("when external group contact has an associated external organization, sets yukonFirstNations from it", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create({
          name: "Test External Organization",
        })
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          title: "Test Agreement",
          purpose: "Test purpose",
          externalGroupContactId: externalGroupContact.id,
        })

        // Act
        const archiveItem = await CreateService.perform(
          informationSharingAgreement,
          { confidentialityReceipt: true },
          currentUser
        )

        // Assert
        expect(archiveItem.yukonFirstNations).toEqual(["Test External Organization"])
      })

      test("when external group contact is missing its associated external organization, creates the archive item without yukonFirstNations", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          title: "Test Agreement",
          purpose: "Test purpose",
          externalGroupContactId: externalGroupContact.id,
        })
        await externalOrganization.destroy()

        // Act
        const archiveItem = await CreateService.perform(
          informationSharingAgreement,
          { confidentialityReceipt: true },
          currentUser
        )

        // Assert
        expect(archiveItem.yukonFirstNations).toEqual([])
      })

      test("when confidentiality receipt is not true, throws an informative error", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          title: "Test Agreement",
          purpose: "Test purpose",
        })

        // Act & Assert
        await expect(
          CreateService.perform(informationSharingAgreement, {}, currentUser)
        ).rejects.toThrow("Confidentiality receipt is required, and must be true")
      })
    })
  })
})
