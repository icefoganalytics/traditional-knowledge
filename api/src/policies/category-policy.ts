import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { Category, User } from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class CategoryPolicy extends PolicyFactory(Category) {
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
    const attributes: (keyof Attributes<Category>)[] = ["name", "description", "retentionId"]

    return attributes
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<Category>> {
    if (user.isExternal) {
      return NO_RECORDS_SCOPE
    }

    return ALL_RECORDS_SCOPE
  }
}

export default CategoryPolicy
