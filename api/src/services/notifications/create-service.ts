import { CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { Notification, User } from "@/models"
import BaseService from "@/services/base-service"

export type NotificationCreationAttributes = Partial<CreationAttributes<Notification>>

export class CreateService extends BaseService {
  constructor(
    private attributes: NotificationCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Notification> {
    const { title, sourceType, userId, ...optionalAttributes } = this.attributes

    if (isNil(title) || isEmpty(title)) {
      throw new Error("Title is required")
    }

    if (isNil(sourceType)) {
      throw new Error("Source type is required")
    }

    if (isNil(userId)) {
      throw new Error("User ID is required")
    }

    const notification = await Notification.create({
      ...optionalAttributes,
      userId,
      title,
      sourceType,
    })

    return notification
  }
}

export default CreateService
