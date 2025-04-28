import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { UserGroup, User } from "@/models"
import { ALL_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class UserGroupPolicy extends PolicyFactory(UserGroup) {
  show(): boolean {
    // TODO: check if user groups should be public information or restricted?
    // maybe you should only see user groups you are part of unless you are a system admin?
    return true
  }

  create(): boolean {
    if (this.user.isSystemAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isSystemAdmin) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isSystemAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    return []
  }

  permittedAttributesForCreate(): Path[] {
    return ["userId", "groupId", ...this.permittedAttributes()]
  }

  static policyScope(_user: User): FindOptions<Attributes<UserGroup>> {
    return ALL_RECORDS_SCOPE
  }
}

export default UserGroupPolicy
