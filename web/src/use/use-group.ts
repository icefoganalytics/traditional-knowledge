import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import groupsApi, {
  type Group,
  type GroupWhereOptions,
  type GroupFiltersOptions,
} from "@/api/groups-api"

export { type Group, type GroupWhereOptions, type GroupFiltersOptions }

export function useGroup(id: Ref<number | null | undefined>) {
  const state = reactive<{
    group: Group | null
    isLoading: boolean
    isErrored: boolean
  }>({
    group: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Group> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { group } = await groupsApi.get(staticId)
      state.isErrored = false
      state.group = group
      return group
    } catch (error) {
      console.error(`Failed to fetch group ${error}:`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<Group> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.group)) {
      throw new Error("No group to save")
    }

    state.isLoading = true
    try {
      const { group } = await groupsApi.update(staticId, state.group)
      state.isErrored = false
      state.group = group
      return group
    } catch (error) {
      console.error(`Failed to save group ${error}:`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
  }
}

export default useGroup
