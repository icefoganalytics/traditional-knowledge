import {
  DataTypes,
  Op,
  sql,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  HasMany,
  Index,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import { arrayWrap } from "@/utils/array-wrap"

import BaseModel from "@/models/base-model"
import User from "@/models/user"

export class ExternalOrganization extends BaseModel<
  InferAttributes<ExternalOrganization>,
  InferCreationAttributes<ExternalOrganization>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(200))
  @NotNull
  @Index({ unique: true })
  declare name: string

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
  @HasMany(() => User, {
    foreignKey: "externalOrganizationId",
    inverse: "externalOrganization",
  })
  declare users?: NonAttribute<User[]>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["name"])

    this.addScope("excludeById", (externalOrganizationIdOrIds: number) => {
      const externalOrganizationIds = arrayWrap(externalOrganizationIdOrIds)
      return {
        where: {
          id: {
            [Op.notIn]: externalOrganizationIds,
          },
        },
      }
    })

    this.addScope("withUserId", (userId: number) => ({
      include: [
        {
          association: "users",
          attributes: [],
          where: {
            id: userId,
          },
        },
      ],
    }))
  }
}

export default ExternalOrganization
