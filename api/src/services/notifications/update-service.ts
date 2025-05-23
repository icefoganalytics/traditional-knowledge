import { Attributes } from "@sequelize/core"

import { Notification } from "@/models"
import BaseService from "@/services/base-service"
import { isUndefined } from "lodash"

export type NotificationUpdateAttributes = Partial<Attributes<Notification>>

export class UpdateService extends BaseService {
  constructor(
    private notification: Notification,
    private attributes: NotificationUpdateAttributes
  ) {
    super()
  }

  async perform() {
    const { readAt } = this.attributes
    // TODO: consider if readAt is a state change and should have it's own endpoint?
    if (!isUndefined(readAt)) {
      this.attributes.readAt = new Date()
    }

    const notification = await this.notification.update(this.attributes)
    return notification
  }
}

export default UpdateService
