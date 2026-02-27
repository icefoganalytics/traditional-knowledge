import { Knex } from "knex"
import { isNil } from "lodash"

import logger from "@/utils/logger"
import { Category } from "@/models"

export async function seed(_knex: Knex): Promise<void> {
  const categoriesAttributes = [
    {
      name: "Cultural Knowledge",
      description:
        "Traditional practices, ceremonies, language, oral history, and cultural teachings",
    },
    {
      name: "Land and Environment",
      description:
        "Traditional territory, land use, environmental knowledge, and natural resource management",
    },
    {
      name: "Governance and Law",
      description:
        "Traditional governance, laws, decision-making processes, and community protocols",
    },
  ]

  for (const categoryAttributes of categoriesAttributes) {
    let category = await Category.findOne({
      where: {
        name: categoryAttributes.name,
      },
    })
    if (isNil(category)) {
      category = await Category.create(categoryAttributes)
      logger.debug("Category created:", { category: category.dataValues })
    } else {
      await category.update(categoryAttributes)
      logger.debug("Category updated:", { category: category.dataValues })
    }
  }
}
