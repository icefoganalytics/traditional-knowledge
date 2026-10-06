import { isNil } from "lodash"

import logger from "@/utils/logger"
import { InformationSharingAgreement, InformationSharingAgreementKnowledgeItem } from "@/models"
import { InformationSharingAgreementKnowledgeItemPolicy } from "@/policies"
import {
  CreateService,
  UpdateService,
} from "@/services/information-sharing-agreement-knowledge-items"
import {
  IndexSerializer,
  ShowSerializer,
} from "@/serializers/information-sharing-agreement-knowledge-items"
import BaseController from "@/controllers/base-controller"

export class InformationSharingAgreementKnowledgeItemsController extends BaseController<InformationSharingAgreementKnowledgeItem> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedInformationSharingAgreementKnowledgeItems =
        InformationSharingAgreementKnowledgeItemPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedInformationSharingAgreementKnowledgeItems.count({ where })
      const informationSharingAgreementKnowledgeItems =
        await scopedInformationSharingAgreementKnowledgeItems.findAll({
          where,
          order,
          limit: this.pagination.limit,
          offset: this.pagination.offset,
        })
      const serializedInformationSharingAgreementKnowledgeItems = IndexSerializer.perform(
        informationSharingAgreementKnowledgeItems
      )
      return this.response.json({
        informationSharingAgreementKnowledgeItems:
          serializedInformationSharingAgreementKnowledgeItems,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching information sharing agreement knowledge items: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: `Error fetching information sharing agreement knowledge items: ${error}`,
      })
    }
  }

  async show() {
    try {
      const informationSharingAgreementKnowledgeItem =
        await this.loadInformationSharingAgreementKnowledgeItem()
      if (isNil(informationSharingAgreementKnowledgeItem)) {
        return this.response.status(404).json({
          message: "Information sharing agreement knowledge item not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreementKnowledgeItem)
      if (!policy.show()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to view this information sharing agreement knowledge item",
        })
      }

      const serializedInformationSharingAgreementKnowledgeItem = ShowSerializer.perform(
        informationSharingAgreementKnowledgeItem
      )
      return this.response.json({
        informationSharingAgreementKnowledgeItem:
          serializedInformationSharingAgreementKnowledgeItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching information sharing agreement knowledge item: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: `Error fetching information sharing agreement knowledge item: ${error}`,
      })
    }
  }

  async create() {
    try {
      const newInformationSharingAgreementKnowledgeItem =
        await this.buildInformationSharingAgreementKnowledgeItem()
      const policy = this.buildPolicy(newInformationSharingAgreementKnowledgeItem)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create information sharing agreement knowledge items",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const informationSharingAgreementKnowledgeItem = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )

      const serializedInformationSharingAgreementKnowledgeItem = ShowSerializer.perform(
        informationSharingAgreementKnowledgeItem
      )
      return this.response.status(201).json({
        informationSharingAgreementKnowledgeItem:
          serializedInformationSharingAgreementKnowledgeItem,
      })
    } catch (error) {
      logger.error(`Error creating information sharing agreement knowledge item: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Error creating information sharing agreement knowledge item: ${error}`,
      })
    }
  }

  async update() {
    try {
      const informationSharingAgreementKnowledgeItem =
        await this.loadInformationSharingAgreementKnowledgeItem()
      if (isNil(informationSharingAgreementKnowledgeItem)) {
        return this.response.status(404).json({
          message: "Information sharing agreement knowledge item not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreementKnowledgeItem)
      if (!policy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to update this information sharing agreement knowledge item",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      await UpdateService.perform(
        informationSharingAgreementKnowledgeItem,
        permittedAttributes,
        this.currentUser
      )

      const serializedInformationSharingAgreementKnowledgeItem = ShowSerializer.perform(
        informationSharingAgreementKnowledgeItem
      )
      return this.response.json({
        informationSharingAgreementKnowledgeItem:
          serializedInformationSharingAgreementKnowledgeItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating information sharing agreement knowledge item: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Error updating information sharing agreement knowledge item: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const informationSharingAgreementKnowledgeItem =
        await this.loadInformationSharingAgreementKnowledgeItem()
      if (isNil(informationSharingAgreementKnowledgeItem)) {
        return this.response.status(404).json({
          message: "Information sharing agreement knowledge item not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreementKnowledgeItem)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to delete this information sharing agreement knowledge item",
        })
      }

      await informationSharingAgreementKnowledgeItem.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting information sharing agreement knowledge item: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Error deleting information sharing agreement knowledge item: ${error}`,
      })
    }
  }

  private async loadInformationSharingAgreementKnowledgeItem() {
    return InformationSharingAgreementKnowledgeItem.findByPk(
      this.params.informationSharingAgreementKnowledgeItemId,
      {
        include: [
          {
            association: "informationSharingAgreement",
            include: ["accessGrants"],
          },
          // The policy checks the Knowledge Item's own access grants, not just the
          // agreement's. See TK-24.
          {
            association: "knowledgeItem",
            include: ["accessGrants"],
          },
        ],
      }
    )
  }

  private async buildInformationSharingAgreementKnowledgeItem() {
    const informationSharingAgreementKnowledgeItem = InformationSharingAgreementKnowledgeItem.build(
      this.request.body
    )
    // TODO: consider nesting this as /information-sharing-agreements/:informationSharingAgreementId/knowledge-items?
    const informationSharingAgreement = await InformationSharingAgreement.findByPk(
      informationSharingAgreementKnowledgeItem.informationSharingAgreementId,
      {
        include: ["accessGrants"],
        rejectOnEmpty: true,
      }
    )
    informationSharingAgreementKnowledgeItem.informationSharingAgreement =
      informationSharingAgreement
    return informationSharingAgreementKnowledgeItem
  }

  private buildPolicy(
    informationSharingAgreementKnowledgeItem: InformationSharingAgreementKnowledgeItem
  ) {
    return new InformationSharingAgreementKnowledgeItemPolicy(
      this.currentUser,
      informationSharingAgreementKnowledgeItem
    )
  }
}

export default InformationSharingAgreementKnowledgeItemsController
