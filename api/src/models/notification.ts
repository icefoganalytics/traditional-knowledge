import {
  type CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  type NonAttribute,
  Op,
  sql,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BeforeSave,
  BelongsTo,
  Default,
  Index,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isNil, truncate } from "lodash"
import { DateTime } from "luxon"

import logger from "@/utils/logger"
import BaseModel from "@/models/base-model"
import User from "@/models/user"

export const TITLE_MAX_LENGTH = 255
export const SUBTITLE_MAX_LENGTH = 255

// Keep in sync with web/src/api/notifications-api.ts
export enum NotificationSourceTypes {
  SYSTEM = "system",
  GROUP = "group",
}

export class Notification extends BaseModel<
  InferAttributes<Notification>,
  InferCreationAttributes<Notification>
> {
  static readonly TITLE_MAX_LENGTH = TITLE_MAX_LENGTH
  static readonly SUBTITLE_MAX_LENGTH = SUBTITLE_MAX_LENGTH
  static readonly SourceTypes = NotificationSourceTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Index
  declare userId: number

  @Attribute(DataTypes.DATE(0))
  declare readAt: Date | null

  @Attribute(DataTypes.STRING(TITLE_MAX_LENGTH))
  @NotNull
  declare title: string

  @Attribute(DataTypes.STRING(SUBTITLE_MAX_LENGTH))
  declare subtitle: string | null

  @Attribute(DataTypes.STRING(1000))
  declare href: string | null

  @Attribute(DataTypes.STRING(50))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(NotificationSourceTypes)],
      msg: `Source type must be one of ${Object.values(NotificationSourceTypes).join(", ")}`,
    },
  })
  declare sourceType: NotificationSourceTypes

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE(0))
  declare deletedAt: Date | null

  // Associations
  @BelongsTo(() => User, {
    foreignKey: "userId",
    inverse: {
      as: "notifications",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  // Hooks
  @BeforeSave
  static sanitizeBeforeSave(notification: Notification) {
    const { title, subtitle } = notification
    if (title.length > TITLE_MAX_LENGTH) {
      logger.warn(`Title "${title}" is too long: truncating to ${TITLE_MAX_LENGTH} characters.`)
      notification.title = this.sanitizeAttribute("title", title)
    }

    if (!isNil(subtitle) && subtitle.length > SUBTITLE_MAX_LENGTH) {
      logger.warn(
        `Subtitle "${subtitle}" is too long: truncating to ${SUBTITLE_MAX_LENGTH} characters.`
      )
      notification.subtitle = this.sanitizeAttribute("subtitle", subtitle)
    }
  }

  static establishScopes() {
    this.addScope("createdTodayInUserTimezone", (timezone: string) => {
      const isoDateString = DateTime.now().setZone(timezone).startOf("day").toISO()
      return {
        where: {
          createdAt: {
            [Op.gte]: isoDateString,
          },
        },
      }
    })
  }

  static sanitizeAttribute(attribute: "title" | "subtitle", value: string): string {
    switch (attribute) {
      case "title":
        return truncate(value, { length: TITLE_MAX_LENGTH })
      case "subtitle":
        return truncate(value, { length: SUBTITLE_MAX_LENGTH })
      default:
        throw new Error(`Unsupported attribute: ${attribute}`)
    }
  }
}

export default Notification
