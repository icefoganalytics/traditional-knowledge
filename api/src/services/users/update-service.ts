import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { User } from "@/models"
import BaseService from "@/services/base-service"

export type UserUpdateAttributes = Partial<Attributes<User>>

export class UpdateService extends BaseService {
  constructor(
    private user: User,
    private attributes: UserUpdateAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<User> {
    this.assertRolesAreGrantable()

    return db.transaction(async () => {
      await this.user.update(this.attributes)
      return this.user.reload({
        include: ["adminGroups", "adminInformationSharingAgreementAccessGrants"],
      })
    })
  }

  /**
   * Enforced here rather than only in the UI, so an admin cannot escalate themselves or
   * anyone else to system admin by crafting a request. See TK-36.
   */
  private assertRolesAreGrantable(): void {
    const { roles } = this.attributes
    if (isNil(roles)) return

    const ungrantableRole = roles.find((role) => !this.currentUser.canGrantRole(role))
    if (!isNil(ungrantableRole)) {
      throw new Error(`You are not authorized to grant the ${ungrantableRole} role`)
    }
  }
}

export default UpdateService
