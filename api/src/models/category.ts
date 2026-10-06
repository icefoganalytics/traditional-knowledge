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
  BelongsToMany,
  Default,
  Index,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import KnowledgeItem from "./knowledge-item"
import KnowledgeItemCategory from "./knowledge-item-category"
import Retention from "@/models/retention"

export class Category extends BaseModel<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @Index({ unique: true, msg: "Category name must be unique" })
  declare name: string

  @Attribute(DataTypes.INTEGER)
  declare retentionId: number | null

  @Attribute(DataTypes.STRING(2000))
  declare description: string | null

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
  @BelongsTo(() => Retention, {
    foreignKey: "retentionId",
    inverse: {
      as: "categories",
      type: "hasMany",
    },
  })
  declare retention?: NonAttribute<Retention>

  @BelongsToMany(() => KnowledgeItem, {
    through: () => KnowledgeItemCategory,
    foreignKey: "categoryId",
    otherKey: "knowledgeItemId",
    throughAssociations: {
      fromSource: "knowledgeItemCategories",
      toSource: "category",
      fromTarget: "knowledgeItemCategories",
      toTarget: "knowledgeItem",
    },
  })
  declare knowledgeItems?: NonAttribute<KnowledgeItem[]>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["name"])
  }
}

export default Category
