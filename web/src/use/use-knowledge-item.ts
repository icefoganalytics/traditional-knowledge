import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { type Policy } from "@/api/base-api"
import knowledgeItemsApi, {
  type KnowledgeItemAsShow,
  type KnowledgeItemWhereOptions,
  type KnowledgeItemFiltersOptions,
} from "@/api/knowledge-items-api"

export {
  type KnowledgeItemAsShow,
  type KnowledgeItemWhereOptions,
  type KnowledgeItemFiltersOptions,
}

export function useKnowledgeItem(id: Ref<number | null | undefined>) {
  const state = reactive<{
    knowledgeItem: KnowledgeItemAsShow | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    knowledgeItem: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<KnowledgeItemAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { knowledgeItem, policy } = await knowledgeItemsApi.get(staticId)
      state.isErrored = false
      state.knowledgeItem = knowledgeItem
      state.policy = policy
      return knowledgeItem
    } catch (error) {
      console.error(`Failed to fetch knowledge item ${error}:`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<KnowledgeItemAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.knowledgeItem)) {
      throw new Error("No knowledge item to save")
    }

    state.isLoading = true
    try {
      const { knowledgeItem } = await knowledgeItemsApi.update(staticId, state.knowledgeItem)
      state.isErrored = false
      state.knowledgeItem = knowledgeItem
      return knowledgeItem
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

export default useKnowledgeItem
