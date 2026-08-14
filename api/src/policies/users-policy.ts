import { Attributes, FindOptions, Op } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { User } from "@/models"
import { ALL_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class UsersPolicy extends PolicyFactory(User) {
  show(): boolean {
    return true
  }

  create(): boolean {
    return this.user.canManageUser(this.record)
  }

  update(): boolean {
    if (this.user.id === this.record.id) return true

    return this.user.canManageUser(this.record)
  }

  destroy(): boolean {
    return this.user.canManageUser(this.record)
  }

  permittedAttributes(): Path[] {
    const attributes: (keyof Attributes<User>)[] = [
      "firstName",
      "lastName",
      "displayName",
      "title",
      "department",
      "division",
      "branch",
      "unit",
      "phoneNumber",
      "emailNotificationsEnabled",
    ]

    if (this.user.canManageUser(this.record)) {
      attributes.push("email", "roles")
    }

    return attributes
  }

  permittedAttributesForCreate(): Path[] {
    return ["isExternal", "externalOrganizationId", ...this.permittedAttributes()]
  }

  /**
   * Anyone administering users sees every record. Everyone else sees a directory:
   * active users only, and an external user additionally sees only their own
   * organization's people, never another First Nation's. The contact autocompletes in
   * the agreement forms read through this scope, so it stays permissive enough for
   * them. See TK-24.
   */
  static policyScope(user: User): FindOptions<Attributes<User>> {
    if (user.isSystemAdmin || user.isAdmin || user.isExternalAdmin) {
      return ALL_RECORDS_SCOPE
    }

    const visibleToEveryone = {
      deactivatedAt: {
        [Op.is]: null,
      },
    }

    if (!user.isExternal) {
      return { where: visibleToEveryone }
    }

    return {
      where: {
        ...visibleToEveryone,
        [Op.or]: [
          { isExternal: false },
          { externalOrganizationId: user.externalOrganizationId },
          { id: user.id },
        ],
      },
    }
  }
}

export default UsersPolicy
