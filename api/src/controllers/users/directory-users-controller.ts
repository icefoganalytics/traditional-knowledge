import { isEmpty, isNil } from "lodash"

import logger from "@/utils/logger"
import { Users } from "@/services"
import { ReferenceSerializer } from "@/serializers/users"
import BaseController from "@/controllers/base-controller"

export class DirectoryUsersController extends BaseController {
  async create() {
    try {
      // Only internal (Yukon Government) staff name Manager contacts on agreements, matching
      // who may author an ISA, so this endpoint is gated the same way. See TK-66.
      if (this.currentUser.isExternal) {
        return this.response.status(403).json({
          message: "You are not authorized to resolve directory users",
        })
      }

      const { email } = this.request.body
      if (isNil(email) || isEmpty(email)) {
        return this.response.status(422).json({
          message: "email is required",
        })
      }

      const user = await Users.EnsureFromDirectoryEmailService.perform(email, this.currentUser)
      return this.response.status(201).json({
        user: ReferenceSerializer.perform(user),
      })
    } catch (error) {
      logger.error(`Error resolving directory user: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error resolving directory user: ${error}`,
      })
    }
  }
}

export default DirectoryUsersController
