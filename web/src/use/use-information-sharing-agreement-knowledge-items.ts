import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import informationSharingAgreementKnowledgeItemsApi, {
  type InformationSharingAgreementKnowledgeItem,
  type InformationSharingAgreementKnowledgeItemWhereOptions,
  type InformationSharingAgreementKnowledgeItemFiltersOptions,
  type InformationSharingAgreementKnowledgeItemQueryOptions,
} from "@/api/information-sharing-agreement-knowledge-items-api"

export {
  type InformationSharingAgreementKnowledgeItem,
  type InformationSharingAgreementKnowledgeItemWhereOptions,
  type InformationSharingAgreementKnowledgeItemFiltersOptions,
  type InformationSharingAgreementKnowledgeItemQueryOptions,
}

export function useInformationSharingAgreementKnowledgeItems(
  queryOptions: Ref<InformationSharingAgreementKnowledgeItemQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    informationSharingAgreementKnowledgeItems: InformationSharingAgreementKnowledgeItem[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    informationSharingAgreementKnowledgeItems: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<InformationSharingAgreementKnowledgeItem[]> {
    state.isLoading = true
    try {
      const { informationSharingAgreementKnowledgeItems, totalCount } =
        await informationSharingAgreementKnowledgeItemsApi.list(unref(queryOptions))
      state.isErrored = false
      state.informationSharingAgreementKnowledgeItems = informationSharingAgreementKnowledgeItems
      state.totalCount = totalCount
      return informationSharingAgreementKnowledgeItems
    } catch (error) {
      console.error("Failed to fetch information sharing agreement knowledge items:", error)
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

export default useInformationSharingAgreementKnowledgeItems
