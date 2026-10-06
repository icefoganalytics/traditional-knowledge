import knowledgeItemAuditsApi, {
  KnowledgeItemAudit,
  KnowledgeItemAuditFiltersOptions,
  KnowledgeItemAuditWhereOptions,
} from "@/api/knowledge-item-audits-api"
import { reactive, ref, Ref, toRefs, unref, watch } from "vue"

export function useKnowledgeItemAudits(
  knowledgeItemId: number,
  queryOptions: Ref<{
    where?: KnowledgeItemAuditWhereOptions
    filters?: KnowledgeItemAuditFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    items: KnowledgeItemAudit[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    items: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<KnowledgeItemAudit[]> {
    state.isLoading = true
    try {
      const { knowledgeItemAudits, totalCount } = await knowledgeItemAuditsApi.list(
        knowledgeItemId,
        unref(queryOptions)
      )
      state.isErrored = false
      state.items = knowledgeItemAudits
      state.totalCount = totalCount
      return knowledgeItemAudits
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

export default useKnowledgeItemAudits
