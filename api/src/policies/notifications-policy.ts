import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { User, Notification } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"

export class NotificationsPolicy extends PolicyFactory(Notification) {
  show(): boolean {
    if (this.record.userId === this.user.id) return true

    return false
  }

  create(): boolean {
    return false
  }

  update(): boolean {
    if (this.record.userId === this.user.id) return true

    return false
  }

  destroy(): boolean {
    return false
  }

  permittedAttributes(): Path[] {
    return ["readAt"]
  }

  static policyScope(user: User): FindOptions<Attributes<Notification>> {
    return {
      where: {
        userId: user.id,
      },
    }
  }
}

export default NotificationsPolicy
