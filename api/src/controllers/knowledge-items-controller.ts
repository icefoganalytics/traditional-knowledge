import { isNil } from "lodash"

import logger from "@/utils/logger"

import { KnowledgeItem, KnowledgeItemAudit } from "@/models"
import { KnowledgeItemsPolicy } from "@/policies"
import { CreateService, DestroyService } from "@/services/knowledge-items"
import { IndexSerializer, ShowSerializer } from "@/serializers/knowledge-items"
import BaseController from "@/controllers/base-controller"

export class KnowledgeItemsController extends BaseController<KnowledgeItem> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes(["KnowledgeItemsOnly", "withKnowledgeItemFileCounts"])
      const scopedItems = KnowledgeItemsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedItems.count({ where })
      const knowledgeItems = await scopedItems.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        include: ["user"],
      })

      const serializedItems = IndexSerializer.perform(knowledgeItems)
      return this.response.json({
        knowledgeItems: serializedItems,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching knowledge items: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching knowledge items: ${error}`,
      })
    }
  }

  async show() {
    try {
      const knowledgeItem = await this.loadKnowledgeItem()
      if (isNil(knowledgeItem)) {
        return this.response.status(404).json({
          message: "Knowledge item not found",
        })
      }

      const policy = this.buildPolicy(knowledgeItem)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this item",
        })
      }

      // TODO: move to /services/knowledge-items/show-service.ts
      await KnowledgeItemAudit.create({
        knowledgeItemId: knowledgeItem.id,
        action: "Viewed Metadata",
        userId: this.currentUser.id,
        description: `${this.currentUser.displayName} viewed metadata`,
      })

      const serializedKnowledgeItem = ShowSerializer.perform(knowledgeItem)

      return this.response.json({
        knowledgeItem: serializedKnowledgeItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching item: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching item: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create items",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const knowledgeItem = await CreateService.perform(
        {
          ...permittedAttributes,
          files: this.request.body.files,
          categoryIds: this.request.body.categoryIds,
        },
        this.currentUser
      )

      // TODO: move to /services/knowledge-items/create-service.ts
      await KnowledgeItemAudit.create({
        knowledgeItemId: knowledgeItem.id,
        action: "Created",
        userId: this.currentUser.id,
        description: `${this.currentUser.displayName} created item`,
      })

      const serializedKnowledgeItem = ShowSerializer.perform(knowledgeItem)

      return this.response.status(201).json({
        knowledgeItem: serializedKnowledgeItem,
      })
    } catch (error) {
      logger.error(`Error creating knowledge item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating knowledge item: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const knowledgeItem = await this.loadKnowledgeItem()
      if (isNil(knowledgeItem)) {
        return this.response.status(404).json({
          message: "Knowledge item not found",
        })
      }

      const policy = this.buildPolicy(knowledgeItem)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this item",
        })
      }

      await DestroyService.perform(knowledgeItem, this.currentUser)
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting knowledge item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error deleting knowledge item: ${error}`,
      })
    }
  }

  private loadKnowledgeItem() {
    return KnowledgeItem.findByPk(this.params.knowledgeItemId, {
      include: [
        "files",
        "user",
        { association: "categories", through: { attributes: [] } },
        {
          association: "accessGrants",
          through: {
            // NOTE: suppressing through model attributes as their names are too long
            attributes: [],
          },
        },
      ],
    })
  }

  private buildPolicy(knowledgeItem: KnowledgeItem = KnowledgeItem.build()) {
    return new KnowledgeItemsPolicy(this.currentUser, knowledgeItem)
  }
}

export default KnowledgeItemsController
