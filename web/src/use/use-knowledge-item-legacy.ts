import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import knowledgeItemsApi, {
  type KnowledgeItemCreate,
  type KnowledgeItem,
} from "@/api/knowledge-items-api"

export { type KnowledgeItem }

export function useKnowledgeItemLegacy(id: Ref<number | null | undefined>) {
  const state = reactive<{
    item: KnowledgeItem | null
    createItem: KnowledgeItemCreate | null
    isUpdate: boolean
    isLoading: boolean
    isErrored: boolean
  }>({
    item: null,
    createItem: null,
    isUpdate: !isNil(id.value),
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<KnowledgeItem> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { knowledgeItem } = await knowledgeItemsApi.get(staticId)
      state.isErrored = false
      state.item = knowledgeItem
      return knowledgeItem
    } catch (error) {
      console.error("Failed to fetch arhive item:", error)

      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<KnowledgeItem> {
    if (state.isUpdate) return update()
    else return create()
  }

  async function update(): Promise<KnowledgeItem> {
    const staticId = unref(id)

    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.item)) {
      throw new Error("No category to save")
    }

    state.isLoading = true
    try {
      const { knowledgeItem } = await knowledgeItemsApi.update(staticId, state.item)
      state.isErrored = false
      state.item = knowledgeItem
      return knowledgeItem
    } catch (error) {
      console.error("Failed to save knowledgeItem:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function create(): Promise<KnowledgeItem> {
    const staticId = unref(id)
    if (!isNil(staticId)) {
      throw new Error("id is not required")
    }

    if (isNil(state.createItem)) {
      throw new Error("No knowledgeItem to save")
    }

    state.isLoading = true
    try {
      const { knowledgeItem } = await knowledgeItemsApi.create(state.createItem)
      state.isErrored = false
      state.item = knowledgeItem
      return knowledgeItem
    } catch (error) {
      console.error("Failed to create knowledgeItem:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) {
        ;(state.item as unknown) = { name: "" }

        return
      }

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

export default useKnowledgeItemLegacy
