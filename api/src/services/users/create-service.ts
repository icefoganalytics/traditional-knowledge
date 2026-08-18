import { CreationAttributes } from "@sequelize/core"

import logger from "@/utils/logger"
import { User } from "@/models"
import BaseService from "@/services/base-service"
import { Notifications, Users } from "@/services"
import { Users as UsersMailers } from "@/mailers"

export type UserCreationAttributes = Partial<CreationAttributes<User>>

export class CreateService extends BaseService {
  constructor(
    private attributes: UserCreationAttributes,
    private currentUser: User,
    private options?: {
      syncWithDirectory?: boolean
    }
  ) {
    super()
  }

  async perform(): Promise<User> {
    const { isExternal } = this.attributes

    const user = isExternal
      ? await Users.CreateExternalService.perform(this.attributes, this.currentUser)
      : await Users.CreateInternalService.perform(this.attributes, this.currentUser, this.options)

    await this.safeAttemptNotifyAdmins(user)

    return user
  }

  /**
   * Telling admins is not worth failing the creation over, and it runs outside the
   * creation transaction so a notification error cannot roll the new user back.
   * See TK-6.
   */
  private async safeAttemptNotifyAdmins(user: User): Promise<void> {
    try {
      await Notifications.Users.NotifyAdminsOfCreatedUserService.perform(user, this.currentUser)
      await UsersMailers.NotifyAdminsOfCreatedUserMailer.perform(user, this.currentUser)
    } catch (error) {
      logger.error(`Failed to notify admins of created user ${user.id}: ${error}`, { error })
    }
  }
}

export default CreateService
