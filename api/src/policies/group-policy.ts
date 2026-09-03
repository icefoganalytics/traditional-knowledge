import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { Group, User } from "@/models"
import { ALL_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class GroupPolicy extends PolicyFactory(Group) {
  show(): boolean {
    if (this.user.isSystemAdmin) return true
    if (!this.user.isExternal) return true

    if (this.user.isMemberOfGroup(this.record.id)) {
      return true
    }

    return false
  }

  create(): boolean {
    if (this.user.isSystemAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isSystemAdmin) return true
    if (this.user.isGroupAdminOf(this.record.id)) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isSystemAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    return ["name", "acronym", "description"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["isExternal", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<Group>> {
    if (!user.isExternal) {
      return ALL_RECORDS_SCOPE
    }

    return {
      include: [
        {
          association: "userGroups",
          where: {
            userId: user.id,
          },
        },
      ],
    }
  }
}

export default GroupPolicy
