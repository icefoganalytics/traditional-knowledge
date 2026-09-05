import { isNil } from "lodash"

import { User } from "@/models"
import { yukonGovernmentIntegration } from "@/integrations"
import BaseService from "@/services/base-service"
import { Users } from "@/services"

/**
 * Resolves a Yukon Government directory email to an internal User record, creating one
 * from the directory when it does not exist yet. Used to record contract contacts (such
 * as the ISA Manager) who are sourced from Active Directory. The returned user is not
 * granted any group membership on its own. See TK-66.
 */
export class EnsureFromDirectoryEmailService extends BaseService {
  constructor(
    private email: string,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<User> {
    const existingUser = await User.findOne({
      where: { email: this.email },
    })
    if (!isNil(existingUser)) {
      return existingUser
    }

    const employee = await yukonGovernmentIntegration.fetchEmployee(this.email)
    if (isNil(employee)) {
      throw new Error(`No Yukon Government directory record found for email: ${this.email}`)
    }

    return Users.CreateInternalService.perform(
      {
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
        displayName: employee.full_name,
        department: employee.department,
        division: employee.division,
        branch: employee.branch,
        unit: employee.unit,
        title: employee.title,
      },
      this.currentUser
    )
  }
}

export default EnsureFromDirectoryEmailService
