import { isNil } from "lodash"

import logger from "@/utils/logger"

import { KnowledgeItem, InformationSharingAgreement } from "@/models"
import { KnowledgeItemsPolicy, InformationSharingAgreementPolicy } from "@/policies"
import { InformationSharingAgreements } from "@/services"
import { ShowSerializer } from "@/serializers/knowledge-items"
import BaseController from "@/controllers/base-controller"

export class KnowledgeItemsController extends BaseController<KnowledgeItem> {
  async create() {
    try {
      const informationSharingAgreement = await this.loadInformationSharingAgreement()
      if (isNil(informationSharingAgreement)) {
        return this.response.status(404).json({
          message: "Information sharing agreement not found.",
        })
      }

      const informationSharingAgreementPolicy = this.buildInformationSharingAgreementPolicy(
        informationSharingAgreement
      )
      if (!informationSharingAgreementPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this information sharing agreement.",
        })
      }

      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to create knowledge items for this information sharing agreement.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const knowledgeItem = await InformationSharingAgreements.KnowledgeItems.CreateService.perform(
        informationSharingAgreement,
        permittedAttributes,
        this.currentUser
      )

      const serializedKnowledgeItem = ShowSerializer.perform(knowledgeItem)
      return this.response.status(201).json({
        knowledgeItem: serializedKnowledgeItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error creating knowledge item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating knowledge item: ${error}`,
      })
    }
  }

  private async loadInformationSharingAgreement(): Promise<InformationSharingAgreement | null> {
    return InformationSharingAgreement.findByPk(this.params.informationSharingAgreementId)
  }

  private buildInformationSharingAgreementPolicy(
    informationSharingAgreement: InformationSharingAgreement
  ): InformationSharingAgreementPolicy {
    return new InformationSharingAgreementPolicy(this.currentUser, informationSharingAgreement)
  }

  private buildPolicy(knowledgeItem: KnowledgeItem = KnowledgeItem.build()): KnowledgeItemsPolicy {
    knowledgeItem.accessGrants ??= []
    return new KnowledgeItemsPolicy(this.currentUser, knowledgeItem)
  }
}

export default KnowledgeItemsController
