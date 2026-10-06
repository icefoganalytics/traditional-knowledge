import {
  type CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  sql,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  ColumnName,
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"

// TODO: remove tableName/ColumnName pins once the archive_* tables are renamed to knowledge_*.
@Table({
  tableName: "archive_item_files",
})
export class KnowledgeItemFile extends BaseModel<
  InferAttributes<KnowledgeItemFile>,
  InferCreationAttributes<KnowledgeItemFile>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @ColumnName("archive_item_id")
  declare knowledgeItemId: number

  @Attribute(DataTypes.STRING(1000))
  declare bucket: string | null

  @Attribute(DataTypes.STRING(2000))
  @NotNull
  declare originalKey: string

  @Attribute(DataTypes.STRING(1000))
  @NotNull
  declare originalFileName: string

  @Attribute(DataTypes.STRING(1000))
  @NotNull
  declare originalMimeType: string

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare originalFileSize: number

  @Attribute(DataTypes.STRING(2000))
  declare pdfKey: string | null

  @Attribute(DataTypes.STRING(1000))
  declare pdfFileName: string | null

  @Attribute(DataTypes.STRING(1000))
  declare pdfMimeType: string | null

  @Attribute(DataTypes.INTEGER)
  declare pdfFileSize: number | null

  @Attribute(DataTypes.TEXT)
  declare comment: string | null

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

  // Scopes
  static establishScopes(): void {
    //this.addSearchScope(["name"])
  }
}

export default KnowledgeItemFile
