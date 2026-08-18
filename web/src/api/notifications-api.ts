import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

// Keep in sync with api/src/models/notification.ts
export enum NotificationSourceTypes {
  SYSTEM = "system",
  GROUP = "group",
  USER = "user",
  ATTACHMENT = "attachment",
  INFORMATION_SHARING_AGREEMENT = "information_sharing_agreement",
}

export type Notification = {
  id: number
  userId: number
  readAt: string | null
  title: string
  subtitle: string | null
  href: string | null
  sourceType: NotificationSourceTypes
  sourceId: number | null
  sourceKey: string | null
  createdAt: string
  updatedAt: string
}

export type NotificationWhereOptions = {
  userId?: number
  readAt?: string | null
  sourceType?: NotificationSourceTypes
}

export type NotificationFiltersOptions = {
  createdTodayInUserTimezone?: string
}

export type NotificationQueryOptions = {
  where?: NotificationWhereOptions
  filters?: NotificationFiltersOptions
  page?: number
  perPage?: number
}

export const notificationsApi = {
  async list(params: NotificationQueryOptions = {}): Promise<{
    notifications: Notification[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/notifications", {
      params,
    })
    return data
  },

  async get(notificationId: number): Promise<{
    notification: Notification
    policy: Policy
  }> {
    const { data } = await http.get(`/api/notifications/${notificationId}`)
    return data
  },

  // Stateful actions
  async read(notificationId: number): Promise<{
    notification: Notification
  }> {
    const { data } = await http.post(`/api/notifications/${notificationId}/read`)
    return data
  },

  async unread(notificationId: number): Promise<{
    notification: Notification
  }> {
    const { data } = await http.delete(`/api/notifications/${notificationId}/read`)
    return data
  },
}

export default notificationsApi
