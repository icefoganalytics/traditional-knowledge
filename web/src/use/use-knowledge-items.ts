import knowledgeItemsApi, {
  KnowledgeItem,
  KnowledgeItemFiltersOptions,
  KnowledgeItemWhereOptions,
} from "@/api/knowledge-items-api"
import { reactive, ref, Ref, toRefs, unref, watch } from "vue"

export function useKnowledgeItems(
  queryOptions: Ref<{
    where?: KnowledgeItemWhereOptions
    filters?: KnowledgeItemFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    items: KnowledgeItem[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    items: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<KnowledgeItem[]> {
    state.isLoading = true
    try {
      const { knowledgeItems, totalCount } = await knowledgeItemsApi.list(unref(queryOptions))
      state.isErrored = false
      state.items = knowledgeItems
      state.totalCount = totalCount
      return knowledgeItems
    } catch (error) {
      console.error("Failed to fetch status:", error)
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
  }
}

export default useKnowledgeItems
