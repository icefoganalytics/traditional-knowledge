import { Op } from "@sequelize/core"

import { Notification, User } from "@/models"
import { UserRoles } from "@/models/user"

import BaseService from "@/services/base-service"
import { Notifications } from "@/services"

export class NotifyAdminsOfCreatedUserService extends BaseService {
  constructor(
    private user: User,
    private currentUser: User
  ) {
    super()
  }

  async perform() {
    const recipients = await this.buildRecipients()

    const { displayName, isExternal } = this.user
    const userType = isExternal === true ? "External" : "Yukon Government"
    const safeTitle = Notification.sanitizeAttribute("title", `New ${userType} User: ${displayName}`)

    for (const recipient of recipients) {
      await Notifications.CreateService.perform(
        {
          title: safeTitle,
          subtitle: `${displayName} was added by ${this.currentUser.displayName}.`,
          href: this.buildHref(),
          userId: recipient.id,
          sourceType: Notification.SourceTypes.USER,
          sourceId: this.user.id,
          sourceKey: "created",
        },
        this.currentUser
      )
    }
  }

  /**
   * System admins always, plus whichever admin role covers this kind of user. The new
   * user and whoever created them are excluded: neither needs telling. See TK-6.
   */
  private async buildRecipients(): Promise<User[]> {
    const excludedUserIds = [this.user.id, this.currentUser.id]
    const managingRole =
      this.user.isExternal === true ? UserRoles.EXTERNAL_ADMIN : UserRoles.ADMIN

    const [systemAdmins, managingAdmins] = await Promise.all([
      User.withScope("isSystemAdmin").findAll({
        where: { id: { [Op.notIn]: excludedUserIds } },
      }),
      User.withScope({ method: ["withRole", managingRole] }).findAll({
        where: { id: { [Op.notIn]: excludedUserIds } },
      }),
    ])

    const recipientsById = new Map<number, User>()
    for (const recipient of [...systemAdmins, ...managingAdmins]) {
      recipientsById.set(recipient.id, recipient)
    }

    return [...recipientsById.values()]
  }

  private buildHref(): string {
    const path = this.user.isExternal === true ? "external-edit" : "internal-edit"
    return `/administration/users/${this.user.id}/${path}`
  }
}

export default NotifyAdminsOfCreatedUserService
