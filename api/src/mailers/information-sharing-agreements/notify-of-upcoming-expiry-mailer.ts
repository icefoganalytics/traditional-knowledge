import { APPLICATION_NAME } from "@/config"

import { InformationSharingAgreement, User } from "@/models"
import ApplicationMailer from "@/mailers/application-mailer"

export class NotifyOfUpcomingExpiryMailer extends ApplicationMailer {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private recipients: User[],
    private daysBeforeExpiry: number
  ) {
    super(__filename)
  }

  async perform() {
    const { id, title, endDate } = this.informationSharingAgreement
    const identifier = `#ISA-${id}`
    const subject =
      this.daysBeforeExpiry === 0
        ? `${APPLICATION_NAME}: Agreement ${identifier} expires today`
        : `${APPLICATION_NAME}: Agreement ${identifier} expires in ${this.daysBeforeExpiry} days`

    const to = this.buildTo(this.recipients)

    const data = {
      identifier,
      title,
      endDate: endDate?.toISOString().slice(0, 10) ?? "Not specified",
      daysBeforeExpiry: this.daysBeforeExpiry,
      expiresToday: this.daysBeforeExpiry === 0,
      informationSharingAgreementId: id,
    }

    return this.mail({ to, subject }, data)
  }
}

export default NotifyOfUpcomingExpiryMailer
