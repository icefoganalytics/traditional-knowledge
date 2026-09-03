import { Attributes, FindOptions } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"

import { ExternalOrganization, User } from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class ExternalOrganizationPolicy extends PolicyFactory(ExternalOrganization) {
  show(): boolean {
    if (this.user.isExternal) {
      return false
    }

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
    return ["name"]
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<ExternalOrganization>> {
    if (user.isExternal) {
      return NO_RECORDS_SCOPE
    }

    return ALL_RECORDS_SCOPE
  }
}
