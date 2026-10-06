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
  tableName: "archive_item_categories",
})
export class KnowledgeItemCategory extends BaseModel<
  InferAttributes<KnowledgeItemCategory>,
  InferCreationAttributes<KnowledgeItemCategory>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @ColumnName("archive_item_id")
  declare knowledgeItemId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare categoryId: number

  @Attribute(DataTypes.INTEGER)
  declare setByUserId: number | null

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

  // Scopes
  static establishScopes(): void {
    //this.addSearchScope(["name"])
  }
}

export default KnowledgeItemCategory
