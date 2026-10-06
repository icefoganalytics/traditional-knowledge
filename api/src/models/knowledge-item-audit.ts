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
  ColumnName,
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import KnowledgeItem from "@/models/knowledge-item"
import KnowledgeItemFile from "@/models/knowledge-item-file"
import User from "@/models/user"

// TODO: remove tableName/ColumnName pins once the archive_* tables are renamed to knowledge_*.
@Table({
  tableName: "archive_item_audits",
})
export class KnowledgeItemAudit extends BaseModel<
  InferAttributes<KnowledgeItemAudit>,
  InferCreationAttributes<KnowledgeItemAudit>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  declare userId?: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @ColumnName("archive_item_id")
  declare knowledgeItemId: number

  @Attribute(DataTypes.INTEGER)
  @ColumnName("archive_item_file_id")
  declare knowledgeItemFileId?: number

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
  @BelongsTo(() => KnowledgeItem, {
    foreignKey: "knowledgeItemId",
    inverse: {
      as: "knowledgeItemAudits",
      type: "hasMany",
    },
  })
  declare knowledgeItem?: NonAttribute<KnowledgeItem>

  @BelongsTo(() => KnowledgeItemFile, {
    foreignKey: "knowledgeItemFileId",
    inverse: {
      as: "knowledgeItemFileAudits",
      type: "hasMany",
    },
  })
  declare knowledgeItemFile?: NonAttribute<KnowledgeItemFile>

  @BelongsTo(() => User, {
    foreignKey: "userId",
    inverse: {
      as: "knowledgeItemAudits",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["action"])
  }
}

export default KnowledgeItemAudit
