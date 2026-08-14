import { Op } from "@sequelize/core"

import { APPLICATION_NAME } from "@/config"

import { User } from "@/models"
import { UserRoles } from "@/models/user"
import ApplicationMailer from "@/mailers/application-mailer"

export class NotifyAdminsOfCreatedUserMailer extends ApplicationMailer {
  constructor(
    private user: User,
    private currentUser: User
  ) {
    super(__filename)
  }

  async perform() {
    const { displayName, email, isExternal } = this.user
    const userType = isExternal === true ? "external" : "Yukon Government"
    const subject = `${APPLICATION_NAME}: A new ${userType} user was added`

    const excludedUserIds = [this.user.id, this.currentUser.id]
    const managingRole = isExternal === true ? UserRoles.EXTERNAL_ADMIN : UserRoles.ADMIN

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

    const to = this.buildTo([...recipientsById.values()])

    const data = {
      displayName,
      email,
      userType,
      createdBy: this.currentUser.displayName,
    }

    return this.mail({ to, subject }, data)
  }
}

export default NotifyAdminsOfCreatedUserMailer
