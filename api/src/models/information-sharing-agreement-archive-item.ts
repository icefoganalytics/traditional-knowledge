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
import ArchiveItem from "@/models/archive-item"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import User from "@/models/user"

export class InformationSharingAgreementArchiveItem extends BaseModel<
  InferAttributes<InformationSharingAgreementArchiveItem>,
  InferCreationAttributes<InformationSharingAgreementArchiveItem>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare informationSharingAgreementId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare archiveItemId: number

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
    foreignKey: "creatorId",
    inverse: {
      as: "createdInformationSharingAgreementArchiveItems",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  @BelongsTo(() => InformationSharingAgreement, {
    foreignKey: "informationSharingAgreementId",
    inverse: {
      as: "informationSharingAgreementArchiveItems",
      type: "hasMany",
    },
  })
  declare informationSharingAgreement?: NonAttribute<InformationSharingAgreement>

  @BelongsTo(() => ArchiveItem, {
    foreignKey: "archiveItemId",
    inverse: {
      as: "informationSharingAgreementArchiveItems",
      type: "hasMany",
    },
  })
  declare archiveItem?: NonAttribute<ArchiveItem>

  // Scopes
  static establishScopes(): void {
    // Add any specific scopes if needed
  }
}

export default InformationSharingAgreementArchiveItem
