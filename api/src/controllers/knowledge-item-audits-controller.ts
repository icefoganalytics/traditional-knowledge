import logger from "@/utils/logger"

import { KnowledgeItemAudit } from "@/models"
import { KnowledgeItemAuditsPolicy } from "@/policies"
import { IndexSerializer } from "@/serializers/knowledge-item-audits"
import BaseController from "@/controllers/base-controller"

export class KnowledgeItemAuditsController extends BaseController<KnowledgeItemAudit> {
  async index() {
    try {
      const where = this.buildWhere({ knowledgeItemId: this.params.knowledgeItemId })
      const scopes = this.buildFilterScopes()
      const scopedItems = KnowledgeItemAuditsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedItems.count({ where })
      const knowledgeItems = await scopedItems.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        include: ["user"],
        order: [["createdAt", "DESC"]],
      })

      const serializedItems = IndexSerializer.perform(knowledgeItems)
      return this.response.json({
        knowledgeItemAudits: serializedItems,
        totalCount,
      })
    } catch (error) {
      logger.error("Error fetching knowledge items audits" + error)
      return this.response.status(400).json({
        message: `Error fetching knowledge items audits: ${error}`,
      })
    }
  }
}

export default KnowledgeItemAuditsController
