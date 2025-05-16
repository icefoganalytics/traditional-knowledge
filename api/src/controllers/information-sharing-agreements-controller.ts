import { isNil } from "lodash"

import logger from "@/utils/logger"
import { InformationSharingAgreement } from "@/models"
import { InformationSharingAgreementPolicy } from "@/policies"
import { CreateService } from "@/services/information-sharing-agreements"
import { IndexSerializer, ShowSerializer } from "@/serializers/information-sharing-agreements"
import BaseController from "@/controllers/base-controller"

export class InformationSharingAgreementsController extends BaseController<InformationSharingAgreement> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedInformationSharingAgreements = InformationSharingAgreementPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedInformationSharingAgreements.count({ where })
      const informationSharingAgreements = await scopedInformationSharingAgreements.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedInformationSharingAgreements = IndexSerializer.perform(
        informationSharingAgreements
      )
      return this.response.json({
        informationSharingAgreements: serializedInformationSharingAgreements,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching information sharing agreements: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching information sharing agreements: ${error}`,
      })
    }
  }

  async show() {
    try {
      const informationSharingAgreement = await this.loadInformationSharingAgreement()
      if (isNil(informationSharingAgreement)) {
        return this.response.status(404).json({
          message: "Information sharing agreement not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreement)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this information sharing agreement",
        })
      }

      const serializedInformationSharingAgreement = ShowSerializer.perform(
        informationSharingAgreement
      )
      return this.response.json({
        informationSharingAgreement: serializedInformationSharingAgreement,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching information sharing agreement: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching information sharing agreement: ${error}`,
      })
    }
  }

  async create() {
    try {
      const newInformationSharingAgreement = await this.buildInformationSharingAgreement()
      const policy = this.buildPolicy(newInformationSharingAgreement)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create information sharing agreements",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const informationSharingAgreement = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )

      const serializedInformationSharingAgreement = ShowSerializer.perform(
        informationSharingAgreement
      )
      return this.response.status(201).json({
        informationSharingAgreement: serializedInformationSharingAgreement,
      })
    } catch (error) {
      logger.error(`Error creating information sharing agreement: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating information sharing agreement: ${error}`,
      })
    }
  }

  async update() {
    try {
      const informationSharingAgreement = await this.loadInformationSharingAgreement()
      if (isNil(informationSharingAgreement)) {
        return this.response.status(404).json({
          message: "Information sharing agreement not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreement)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this information sharing agreement",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      await informationSharingAgreement.update(permittedAttributes)
      const serializedInformationSharingAgreement = ShowSerializer.perform(
        informationSharingAgreement
      )
      return this.response.json({
        informationSharingAgreement: serializedInformationSharingAgreement,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating information sharing agreement: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error updating information sharing agreement: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const informationSharingAgreement = await this.loadInformationSharingAgreement()
      if (isNil(informationSharingAgreement)) {
        return this.response.status(404).json({
          message: "Information sharing agreement not found",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreement)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this information sharing agreement",
        })
      }

      await informationSharingAgreement.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting information sharing agreement: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error deleting information sharing agreement: ${error}`,
      })
    }
  }

  private async loadInformationSharingAgreement() {
    return InformationSharingAgreement.findByPk(this.params.informationSharingAgreementId, {
      include: ["creator", "sharingGroup", "receivingGroup"],
    })
  }

  private async buildInformationSharingAgreement() {
    const informationSharingAgreement = InformationSharingAgreement.build(this.request.body)
    return informationSharingAgreement
  }

  private buildPolicy(informationSharingAgreement: InformationSharingAgreement) {
    return new InformationSharingAgreementPolicy(this.currentUser, informationSharingAgreement)
  }
}

export default InformationSharingAgreementsController
