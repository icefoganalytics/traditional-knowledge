import { Op } from "@sequelize/core"
import { DateTime } from "luxon"
import { isNil } from "lodash"

import logger from "@/utils/logger"
import { InformationSharingAgreement, Notification, User } from "@/models"
import BaseService from "@/services/base-service"
import { Notifications } from "@/services"
import { InformationSharingAgreements as InformationSharingAgreementMailers } from "@/mailers"

/** How many days before expiry each reminder goes out. */
export const REMINDER_DAYS_BEFORE_EXPIRY = [30, 7, 0]

/**
 * Warns the people named on an agreement that it is about to expire, since expiry
 * permanently removes the Traditional Knowledge from the Vault.
 *
 * Runs daily. Each reminder is recorded against the agreement so re-running the job,
 * or running two schedulers at once, cannot send the same reminder twice. See TK-6.
 */
export class NotifyOfUpcomingExpiryService extends BaseService {
  async perform(): Promise<void> {
    const today = DateTime.utc().startOf("day")

    for (const daysBefore of REMINDER_DAYS_BEFORE_EXPIRY) {
      const targetDate = today.plus({ days: daysBefore })

      await InformationSharingAgreement.findEach(
        {
          where: {
            status: InformationSharingAgreement.Status.SIGNED,
            // Agreements that end on the completion of a purpose have no date to count
            // down to, so they are not reminded about.
            expirationCondition: {
              [Op.in]: [
                InformationSharingAgreement.ExpirationConditions.EXPIRATION_DATE,
                InformationSharingAgreement.ExpirationConditions
                  .UNDETERMINED_WITH_DEFAULT_EXPIRATION,
              ],
            },
            endDate: {
              [Op.gte]: targetDate.toJSDate(),
              [Op.lt]: targetDate.plus({ days: 1 }).toJSDate(),
            },
          },
          include: [
            "creator",
            "externalGroupContact",
            "internalGroupContact",
            "internalGroupSecondaryContact",
          ],
        },
        async (informationSharingAgreement) => {
          await this.safeAttemptNotify(informationSharingAgreement, daysBefore)
        }
      )
    }
  }

  private async safeAttemptNotify(
    informationSharingAgreement: InformationSharingAgreement,
    daysBefore: number
  ): Promise<void> {
    try {
      await this.notify(informationSharingAgreement, daysBefore)
    } catch (error) {
      logger.error(
        `Failed to notify of upcoming expiry for information sharing agreement ${informationSharingAgreement.id}: ${error}`,
        { error }
      )
    }
  }

  private async notify(
    informationSharingAgreement: InformationSharingAgreement,
    daysBefore: number
  ): Promise<void> {
    const sourceKey = `expiry-${daysBefore}`
    const recipients = await this.buildRecipients(informationSharingAgreement)
    if (recipients.length === 0) return

    const { id, title } = informationSharingAgreement
    const safeTitle = Notification.sanitizeAttribute(
      "title",
      `Agreement Expiring: #ISA-${id} - ${title}`
    )
    const subtitle =
      daysBefore === 0
        ? "This agreement expires today. Its Traditional Knowledge will be permanently removed."
        : `This agreement expires in ${daysBefore} days. Its Traditional Knowledge will then be permanently removed.`

    const notifiedRecipients: User[] = []
    for (const recipient of recipients) {
      const alreadyNotified = await Notification.findOne({
        where: {
          userId: recipient.id,
          sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
          sourceId: id,
          sourceKey,
        },
      })
      if (!isNil(alreadyNotified)) continue

      await Notifications.CreateService.perform(
        {
          title: safeTitle,
          subtitle,
          href: `/information-sharing-agreements/${id}`,
          userId: recipient.id,
          sourceType: Notification.SourceTypes.INFORMATION_SHARING_AGREEMENT,
          sourceId: id,
          sourceKey,
        },
        recipient
      )
      notifiedRecipients.push(recipient)
    }

    if (notifiedRecipients.length === 0) return

    await InformationSharingAgreementMailers.NotifyOfUpcomingExpiryMailer.perform(
      informationSharingAgreement,
      notifiedRecipients,
      daysBefore
    )
  }

  /** The people named on the agreement, plus system admins, deduplicated. */
  private async buildRecipients(
    informationSharingAgreement: InformationSharingAgreement
  ): Promise<User[]> {
    const systemAdmins = await User.withScope("isSystemAdmin").findAll()

    const named = [
      informationSharingAgreement.creator,
      informationSharingAgreement.externalGroupContact,
      informationSharingAgreement.internalGroupContact,
      informationSharingAgreement.internalGroupSecondaryContact,
    ]

    const recipientsById = new Map<number, User>()
    for (const recipient of [...named, ...systemAdmins]) {
      if (isNil(recipient)) continue

      recipientsById.set(recipient.id, recipient)
    }

    return [...recipientsById.values()]
  }
}

export default NotifyOfUpcomingExpiryService
