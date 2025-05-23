import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import notificationsApi, {
  NotificationSourceTypes,
  type Notification,
  type NotificationQueryOptions,
  type NotificationWhereOptions,
  type NotificationFiltersOptions,
} from "@/api/notifications-api"

export {
  NotificationSourceTypes,
  type Notification,
  type NotificationQueryOptions,
  type NotificationWhereOptions,
  type NotificationFiltersOptions,
}

export function useNotifications(
  queryOptions: Ref<NotificationQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    notifications: Notification[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    notifications: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Notification[]> {
    state.isLoading = true
    try {
      const { notifications, totalCount } = await notificationsApi.list(unref(queryOptions))
      state.isErrored = false
      state.notifications = notifications
      state.totalCount = totalCount
      return notifications
    } catch (error) {
      console.error(`Failed to fetch notifications: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(queryOptions)],
    async ([skip]) => {
      if (skip) return

      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useNotifications
