import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Notification } from "@/models"
import { NotificationsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/notifications"
import BaseController from "@/controllers/base-controller"

export class NotificationsController extends BaseController<Notification> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const scopedNotifications = NotificationsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedNotifications.count({ where })
      const notifications = await scopedNotifications.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order: [["createdAt", "DESC"]],
      })
      return this.response.json({
        notifications,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching notifications: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching notifications: ${error}`,
      })
    }
  }

  async show() {
    try {
      const notification = await this.loadNotification()
      if (!notification) {
        return this.response.status(404).json({
          message: "Notification not found",
        })
      }

      const policy = this.buildPolicy(notification)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this notification",
        })
      }

      return this.response.json({ notification, policy })
    } catch (error) {
      logger.error(`Error fetching notification: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching notification: ${error}`,
      })
    }
  }

  async create() {
    try {
      const newNotification = await this.buildNotification()
      const policy = this.buildPolicy(newNotification)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create notifications",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const notification = await CreateService.perform(permittedAttributes, this.currentUser)

      return this.response.status(201).json({
        notification,
      })
    } catch (error) {
      logger.error(`Error creating notification: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating notification: ${error}`,
      })
    }
  }

  async update() {
    try {
      const notification = await this.loadNotification()
      if (isNil(notification)) {
        return this.response.status(404).json({
          message: "Notification not found",
        })
      }

      const policy = this.buildPolicy(notification)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this notification",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      await UpdateService.perform(notification, permittedAttributes)
      return this.response.json({ notification })
    } catch (error) {
      logger.error(`Error updating notification: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error updating notification: ${error}`,
      })
    }
  }

  private async loadNotification() {
    return Notification.findByPk(this.params.notificationId)
  }

  private async buildNotification() {
    return Notification.build(this.request.body)
  }

  private buildPolicy(notification: Notification = Notification.build()) {
    return new NotificationsPolicy(this.currentUser, notification)
  }
}

export default NotificationsController
