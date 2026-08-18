import { describe, test, expect } from "vitest"
import { DateTime } from "luxon"

import { InformationSharingAgreement, Notification } from "@/models"
import { informationSharingAgreementFactory, userFactory } from "@/tests/factories"

import NotifyOfUpcomingExpiryService from "@/services/information-sharing-agreements/notify-of-upcoming-expiry-service"

describe("api/src/services/information-sharing-agreements/notify-of-upcoming-expiry-service.ts", () => {
  describe("NotifyOfUpcomingExpiryService", () => {
    describe("#perform", () => {
      async function buildExpiringAgreement(daysFromNow: number) {
        const creator = await userFactory.create({ isExternal: false })
        return informationSharingAgreementFactory.create({
          creatorId: creator.id,
          status: InformationSharingAgreement.Status.SIGNED,
          expirationCondition: InformationSharingAgreement.ExpirationConditions.EXPIRATION_DATE,
          endDate: DateTime.utc().startOf("day").plus({ days: daysFromNow }).toJSDate(),
        })
      }

      test("when an agreement expires in 30 days, notifies the creator", async () => {
        // Arrange
        const informationSharingAgreement = await buildExpiringAgreement(30)

        // Act
        await NotifyOfUpcomingExpiryService.perform()

        // Assert
        const notifications = await Notification.findAll({
          where: {
            sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
            sourceId: informationSharingAgreement.id,
          },
        })
        expect(notifications).toEqual([
          expect.objectContaining({
            userId: informationSharingAgreement.creatorId,
            sourceKey: "expiry-30",
          }),
        ])
      })

      // Without this the daily job would re-notify everyone every morning. See TK-6.
      test("when run twice, does not send the same reminder again", async () => {
        // Arrange
        const informationSharingAgreement = await buildExpiringAgreement(7)

        // Act
        await NotifyOfUpcomingExpiryService.perform()
        await NotifyOfUpcomingExpiryService.perform()

        // Assert
        const notifications = await Notification.findAll({
          where: {
            sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
            sourceId: informationSharingAgreement.id,
          },
        })
        expect(notifications).toHaveLength(1)
      })

      test("when an agreement is still a draft, does not notify", async () => {
        // Arrange
        const creator = await userFactory.create({ isExternal: false })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: creator.id,
          status: InformationSharingAgreement.Status.DRAFT,
          expirationCondition: InformationSharingAgreement.ExpirationConditions.EXPIRATION_DATE,
          endDate: DateTime.utc().startOf("day").plus({ days: 30 }).toJSDate(),
        })

        // Act
        await NotifyOfUpcomingExpiryService.perform()

        // Assert
        const notifications = await Notification.findAll({
          where: {
            sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
            sourceId: informationSharingAgreement.id,
          },
        })
        expect(notifications).toEqual([])
      })

      // These agreements end on an event, not a date, so there is nothing to count down to.
      test("when the agreement ends on completion of purpose, does not notify", async () => {
        // Arrange
        const creator = await userFactory.create({ isExternal: false })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: creator.id,
          status: InformationSharingAgreement.Status.SIGNED,
          expirationCondition:
            InformationSharingAgreement.ExpirationConditions.COMPLETION_OF_PURPOSE,
          endDate: DateTime.utc().startOf("day").plus({ days: 30 }).toJSDate(),
        })

        // Act
        await NotifyOfUpcomingExpiryService.perform()

        // Assert
        const notifications = await Notification.findAll({
          where: {
            sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
            sourceId: informationSharingAgreement.id,
          },
        })
        expect(notifications).toEqual([])
      })

      test("when the expiry is not on a reminder day, does not notify", async () => {
        // Arrange
        const informationSharingAgreement = await buildExpiringAgreement(21)

        // Act
        await NotifyOfUpcomingExpiryService.perform()

        // Assert
        const notifications = await Notification.findAll({
          where: {
            sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
            sourceId: informationSharingAgreement.id,
          },
        })
        expect(notifications).toEqual([])
      })
    })
  })
})
