import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import userGroupsApi, {
  type UserGroupAsIndex,
  type UserGroupFiltersOptions,
  type UserGroupQueryOptions,
  type UserGroupWhereOptions,
} from "@/api/user-groups-api"

export {
  type UserGroupAsIndex,
  type UserGroupFiltersOptions,
  type UserGroupQueryOptions,
  type UserGroupWhereOptions,
}

export function useUserGroups(
  queryOptions: Ref<UserGroupQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    userGroups: UserGroupAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    userGroups: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<UserGroupAsIndex[]> {
    state.isLoading = true
    try {
      const { userGroups, totalCount } = await userGroupsApi.list(unref(queryOptions))
      state.isErrored = false
      state.userGroups = userGroups
      state.totalCount = totalCount
      return userGroups
    } catch (error) {
      console.error("Failed to fetch user groups:", error)
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

export default useUserGroups
