import { describe, test, expect } from "vitest"

import { Attachment, InformationSharingAgreement, Notification } from "@/models"
import {
  attachmentFactory,
  informationSharingAgreementFactory,
  userFactory,
} from "@/tests/factories"

import DestroyService from "@/services/attachments/destroy-service"

describe("api/src/services/attachments/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe("#perform", () => {
      test("when the attachment exists, destroys it", async () => {
        // Arrange
        const currentUser = await userFactory.create({ isExternal: false })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: currentUser.id,
          status: InformationSharingAgreement.Status.SIGNED,
        })
        const attachment = await attachmentFactory.create({
          targetId: informationSharingAgreement.id,
        })

        // Act
        await DestroyService.perform(attachment, currentUser)

        // Assert
        const remaining = await Attachment.findByPk(attachment.id)
        expect(remaining).toBe(null)
      })

      // The person doing the deleting does not need telling. See TK-6.
      test("when another contact deletes it, notifies the agreement creator", async () => {
        // Arrange
        const creator = await userFactory.create({ isExternal: false })
        const currentUser = await userFactory.create({ isExternal: false })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: creator.id,
          status: InformationSharingAgreement.Status.SIGNED,
        })
        const attachment = await attachmentFactory.create({
          targetId: informationSharingAgreement.id,
        })

        // Act
        await DestroyService.perform(attachment, currentUser)

        // Assert
        const notifications = await Notification.findAll({
          where: {
            sourceType: Notification.SourceTypes.ATTACHMENT,
            sourceId: attachment.id,
          },
        })
        expect(notifications).toEqual([
          expect.objectContaining({
            userId: creator.id,
            sourceKey: "destroyed",
          }),
        ])
      })
    })
  })
})
