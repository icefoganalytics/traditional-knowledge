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
  ColumnName,
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import KnowledgeItem from "@/models/knowledge-item"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import User from "@/models/user"

// TODO: remove tableName/ColumnName pins once the archive_* tables are renamed to knowledge_*.
@Table({
  tableName: "information_sharing_agreement_archive_items",
})
export class InformationSharingAgreementKnowledgeItem extends BaseModel<
  InferAttributes<InformationSharingAgreementKnowledgeItem>,
  InferCreationAttributes<InformationSharingAgreementKnowledgeItem>
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
  @ColumnName("archive_item_id")
  declare knowledgeItemId: number

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
      as: "createdInformationSharingAgreementKnowledgeItems",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  @BelongsTo(() => InformationSharingAgreement, {
    foreignKey: "informationSharingAgreementId",
    inverse: {
      as: "informationSharingAgreementKnowledgeItems",
      type: "hasMany",
    },
  })
  declare informationSharingAgreement?: NonAttribute<InformationSharingAgreement>

  @BelongsTo(() => KnowledgeItem, {
    foreignKey: "knowledgeItemId",
    inverse: {
      as: "informationSharingAgreementKnowledgeItems",
      type: "hasMany",
    },
  })
  declare knowledgeItem?: NonAttribute<KnowledgeItem>

  // Scopes
  static establishScopes(): void {
    // Add any specific scopes if needed
  }
}

export default InformationSharingAgreementKnowledgeItem
