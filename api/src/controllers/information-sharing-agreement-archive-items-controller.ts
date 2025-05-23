import { isNil } from "lodash"

import logger from "@/utils/logger"
import { InformationSharingAgreementArchiveItem } from "@/models"
import { InformationSharingAgreementArchiveItemPolicy } from "@/policies"
import {
  CreateService,
  UpdateService,
} from "@/services/information-sharing-agreement-archive-items"
import {
  IndexSerializer,
  ShowSerializer,
} from "@/serializers/information-sharing-agreement-archive-items"
import BaseController from "@/controllers/base-controller"

export class InformationSharingAgreementArchiveItemsController extends BaseController<InformationSharingAgreementArchiveItem> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedInformationSharingAgreementArchiveItems =
        InformationSharingAgreementArchiveItemPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedInformationSharingAgreementArchiveItems.count({ where })
      const informationSharingAgreementArchiveItems =
        await scopedInformationSharingAgreementArchiveItems.findAll({
          where,
          order,
          limit: this.pagination.limit,
          offset: this.pagination.offset,
        })
      const serializedInformationSharingAgreementArchiveItems = IndexSerializer.perform(
        informationSharingAgreementArchiveItems
      )
      return this.response.json({
        informationSharingAgreementArchiveItems: serializedInformationSharingAgreementArchiveItems,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching information sharing agreement archive items: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: `Error fetching information sharing agreement archive items: ${error}`,
      })
    }
  }

  async show() {
    try {
      const informationSharingAgreementArchiveItem =
        await this.loadInformationSharingAgreementArchiveItem()
      if (isNil(informationSharingAgreementArchiveItem)) {
        return this.response.status(404).json({
          message: "Information sharing agreement archive item not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreementArchiveItem)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this information sharing agreement archive item",
        })
      }

      const serializedInformationSharingAgreementArchiveItem = ShowSerializer.perform(
        informationSharingAgreementArchiveItem
      )
      return this.response.json({
        informationSharingAgreementArchiveItem: serializedInformationSharingAgreementArchiveItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching information sharing agreement archive item: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching information sharing agreement archive item: ${error}`,
      })
    }
  }

  async create() {
    try {
      const newInformationSharingAgreementArchiveItem =
        await this.buildInformationSharingAgreementArchiveItem()
      const policy = this.buildPolicy(newInformationSharingAgreementArchiveItem)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create information sharing agreement archive items",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const informationSharingAgreementArchiveItem = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )

      const serializedInformationSharingAgreementArchiveItem = ShowSerializer.perform(
        informationSharingAgreementArchiveItem
      )
      return this.response.status(201).json({
        informationSharingAgreementArchiveItem: serializedInformationSharingAgreementArchiveItem,
      })
    } catch (error) {
      logger.error(`Error creating information sharing agreement archive item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating information sharing agreement archive item: ${error}`,
      })
    }
  }

  async update() {
    try {
      const informationSharingAgreementArchiveItem =
        await this.loadInformationSharingAgreementArchiveItem()
      if (isNil(informationSharingAgreementArchiveItem)) {
        return this.response.status(404).json({
          message: "Information sharing agreement archive item not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreementArchiveItem)
      if (!policy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to update this information sharing agreement archive item",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      await UpdateService.perform(
        informationSharingAgreementArchiveItem,
        permittedAttributes,
        this.currentUser
      )

      const serializedInformationSharingAgreementArchiveItem = ShowSerializer.perform(
        informationSharingAgreementArchiveItem
      )
      return this.response.json({
        informationSharingAgreementArchiveItem: serializedInformationSharingAgreementArchiveItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating information sharing agreement archive item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error updating information sharing agreement archive item: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const informationSharingAgreementArchiveItem =
        await this.loadInformationSharingAgreementArchiveItem()
      if (isNil(informationSharingAgreementArchiveItem)) {
        return this.response.status(404).json({
          message: "Information sharing agreement archive item not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreementArchiveItem)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to delete this information sharing agreement archive item",
        })
      }

      await informationSharingAgreementArchiveItem.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting information sharing agreement archive item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error deleting information sharing agreement archive item: ${error}`,
      })
    }
  }

  private async loadInformationSharingAgreementArchiveItem() {
    return InformationSharingAgreementArchiveItem.findByPk(
      this.params.informationSharingAgreementArchiveItemId
    )
  }

  private async buildInformationSharingAgreementArchiveItem() {
    const informationSharingAgreementArchiveItem = InformationSharingAgreementArchiveItem.build(
      this.request.body
    )
    return informationSharingAgreementArchiveItem
  }

  private buildPolicy(
    informationSharingAgreementArchiveItem: InformationSharingAgreementArchiveItem
  ) {
    return new InformationSharingAgreementArchiveItemPolicy(
      this.currentUser,
      informationSharingAgreementArchiveItem
    )
  }
}

export default InformationSharingAgreementArchiveItemsController
