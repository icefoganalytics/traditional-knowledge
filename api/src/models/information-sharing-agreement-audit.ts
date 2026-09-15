import {
  type CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  type NonAttribute,
  sql,
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
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import User from "@/models/user"

export class InformationSharingAgreementAudit extends BaseModel<
  InferAttributes<InformationSharingAgreementAudit>,
  InferCreationAttributes<InformationSharingAgreementAudit>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  declare userId?: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare informationSharingAgreementId: number

  @Attribute(DataTypes.STRING(200))
  @NotNull
  declare action: string

  @Attribute(DataTypes.STRING(2000))
  declare description?: string

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
  @BelongsTo(() => InformationSharingAgreement, {
    foreignKey: "informationSharingAgreementId",
    inverse: {
      as: "informationSharingAgreementAudits",
      type: "hasMany",
    },
  })
  declare informationSharingAgreement?: NonAttribute<InformationSharingAgreement>

  @BelongsTo(() => User, {
    foreignKey: "userId",
    inverse: {
      as: "informationSharingAgreementAudits",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["action"])
  }
}

export default InformationSharingAgreementAudit
