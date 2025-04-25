import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const UserGroupUniqueIndex = createIndexDecorator("user_groups_user_group", {
  unique: true,
  where: {
    deletedAt: {
      [Op.is]: null,
    },
  },
})

export default UserGroupUniqueIndex
