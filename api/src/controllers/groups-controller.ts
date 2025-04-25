import { isNil } from "lodash"

import logger from "@/utils/logger"
import { Group } from "@/models"
import { GroupPolicy } from "@/policies"
import { CreateService } from "@/services/groups"
import BaseController from "@/controllers/base-controller"

export class GroupsController extends BaseController<Group> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedGroups = GroupPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedGroups.count({ where })
      const groups = await scopedGroups.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      return this.response.json({
        groups,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching groups: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching groups: ${error}`,
      })
    }
  }

  async show() {
    try {
      const group = await this.loadGroup()
      if (isNil(group)) {
        return this.response.status(404).json({
          message: "Group not found",
        })
      }

      const policy = this.buildPolicy(group)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this group",
        })
      }

      return this.response.json({ group, policy })
    } catch (error) {
      logger.error(`Error fetching group: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching group: ${error}`,
      })
    }
  }

  async create() {
    try {
      const newGroup = await this.buildGroup()
      const policy = this.buildPolicy(newGroup)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create groups",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const group = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({
        group,
      })
    } catch (error) {
      logger.error(`Error creating group: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating group: ${error}`,
      })
    }
  }

  async update() {
    try {
      const group = await this.loadGroup()
      if (isNil(group)) {
        return this.response.status(404).json({
          message: "Group not found",
        })
      }

      const policy = this.buildPolicy(group)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this group",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      await group.update(permittedAttributes)
      return this.response.json({ group })
    } catch (error) {
      logger.error(`Error updating group: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error updating group: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const group = await this.loadGroup()
      if (isNil(group)) {
        return this.response.status(404).json({
          message: "Group not found",
        })
      }

      const policy = this.buildPolicy(group)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this group",
        })
      }

      await group.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting group: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error deleting group: ${error}`,
      })
    }
  }

  private async loadGroup() {
    return Group.findByPk(this.params.groupId)
  }

  private async buildGroup() {
    const group = Group.build(this.request.body)
    return group
  }

  private buildPolicy(group: Group) {
    return new GroupPolicy(this.currentUser, group)
  }
}

export default GroupsController
