import { isEmpty, merge } from "lodash"

import { APPLICATION_NAME, FRONTEND_URL } from "@/config"
import { User } from "@/models"

import logger from "@/utils/logger"
import BaseMailer, { MailPriority } from "@/mailers/base-mailer"

export { MailPriority }

export class ApplicationMailer extends BaseMailer {
  protected async mail(
    {
      to,
      subject,
      priority,
    }: {
      to: string
      subject: string
      priority?: MailPriority
    },
    data?: Record<string, unknown>
  ) {
    const dataWithDefaults = merge(
      {
        FRONTEND_URL,
        APPLICATION_NAME,
        PAGE_TITLE: subject,
      },
      data
    )

    if (isEmpty(to)) {
      logger.warn(
        `No recipients for email subject "${subject}". Email not sent.` +
          " This can occur when all recipient users have email notifications disabled."
      )
      return
    }

    return super.mail(
      {
        to,
        subject,
        priority,
      },
      dataWithDefaults
    )
  }

  protected buildTo(users: User[]): string {
    return users.map((user) => user.email).join(", ")
  }
}

export default ApplicationMailer
