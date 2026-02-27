import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { type Policy } from "@/api/base-api"
import archiveItemsApi, {
  type ArchiveItemAsShow,
  type ArchiveItemWhereOptions,
  type ArchiveItemFiltersOptions,
} from "@/api/archive-items-api"

export { type ArchiveItemAsShow, type ArchiveItemWhereOptions, type ArchiveItemFiltersOptions }

export function useArchiveItem(id: Ref<number | null | undefined>) {
  const state = reactive<{
    archiveItem: ArchiveItemAsShow | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    archiveItem: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<ArchiveItemAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { archiveItem, policy } = await archiveItemsApi.get(staticId)
      state.isErrored = false
      state.archiveItem = archiveItem
      state.policy = policy
      return archiveItem
    } catch (error) {
      console.error(`Failed to fetch knowledge item ${error}:`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<ArchiveItemAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.archiveItem)) {
      throw new Error("No knowledge item to save")
    }

    state.isLoading = true
    try {
      const { archiveItem } = await archiveItemsApi.update(staticId, state.archiveItem)
      state.isErrored = false
      state.archiveItem = archiveItem
      return archiveItem
    } catch (error) {
      console.error(`Failed to save knowledge item ${error}:`, { error })
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

export default useArchiveItem
