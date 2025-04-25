import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import groupsApi, {
  type Group,
  type GroupWhereOptions,
  type GroupFiltersOptions,
  type GroupQueryOptions,
} from "@/api/groups-api"

export { type Group, type GroupWhereOptions, type GroupFiltersOptions, type GroupQueryOptions }

export function useGroups(
  queryOptions: Ref<GroupQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    groups: Group[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    groups: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Group[]> {
    state.isLoading = true
    try {
      const { groups, totalCount } = await groupsApi.list(unref(queryOptions))
      state.isErrored = false
      state.groups = groups
      state.totalCount = totalCount
      return groups
    } catch (error) {
      console.error("Failed to fetch groups:", error)
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

export default useGroups
