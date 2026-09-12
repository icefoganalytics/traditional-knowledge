import logger from "@/utils/logger"

import { InformationSharingAgreementAudit } from "@/models"
import { InformationSharingAgreementAuditsPolicy } from "@/policies"
import { IndexSerializer } from "@/serializers/information-sharing-agreement-audits"
import BaseController from "@/controllers/base-controller"

export class InformationSharingAgreementAuditsController extends BaseController<InformationSharingAgreementAudit> {
  async index() {
    try {
      const where = this.buildWhere({
        informationSharingAgreementId: this.params.informationSharingAgreementId,
      })
      const scopes = this.buildFilterScopes()
      const scopedItems = InformationSharingAgreementAuditsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedItems.count({ where })
      const informationSharingAgreementAudits = await scopedItems.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        include: ["user"],
        order: [["createdAt", "DESC"]],
      })

      const serializedItems = IndexSerializer.perform(informationSharingAgreementAudits)
      return this.response.json({
        informationSharingAgreementAudits: serializedItems,
        totalCount,
      })
    } catch (error) {
      logger.error("Error fetching information sharing agreement audits" + error)
      return this.response.status(400).json({
        message: `Error fetching information sharing agreement audits: ${error}`,
      })
    }
  }
}

export default InformationSharingAgreementAuditsController
