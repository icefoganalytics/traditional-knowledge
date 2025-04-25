import {
  DataTypes,
  sql,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import User from "@/models/user"
import Group from "@/models/group"
import { UserGroupUniqueIndex } from "@/models/complex-multi-column-indexes"

export class UserGroup extends BaseModel<
  InferAttributes<UserGroup>,
  InferCreationAttributes<UserGroup>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @UserGroupUniqueIndex
  declare userId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @UserGroupUniqueIndex
  declare groupId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare creatorId: number

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE(0))
  declare deletedAt: Date | null

  // Associations
  @BelongsTo(() => User, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
    inverse: {
      as: "userGroups",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  @BelongsTo(() => Group, {
    foreignKey: {
      name: "groupId",
      allowNull: false,
    },
    inverse: {
      as: "userGroups",
      type: "hasMany",
    },
  })
  declare group?: NonAttribute<Group>

  @BelongsTo(() => User, {
    foreignKey: "creatorId",
    inverse: {
      as: "createdUserGroups",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  // Scopes
  static establishScopes(): void {
    // add as needed
  }
}

export default UserGroup
