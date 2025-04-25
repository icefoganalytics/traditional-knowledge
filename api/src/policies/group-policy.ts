import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { Group, User } from "@/models"
import { ALL_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class GroupPolicy extends PolicyFactory(Group) {
  show(): boolean {
    // TODO: check if groups should be public information or restricted?
    // maybe you should only see groups you are part of unless you are a system admin?
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
    return ["name", "acronym", "description"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["isHost", ...this.permittedAttributes()]
  }

  static policyScope(_user: User): FindOptions<Attributes<Group>> {
    return ALL_RECORDS_SCOPE
  }
}

export default GroupPolicy
