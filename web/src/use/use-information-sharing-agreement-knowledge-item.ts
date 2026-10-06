import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import informationSharingAgreementKnowledgeItemsApi, {
  type InformationSharingAgreementKnowledgeItem,
} from "@/api/information-sharing-agreement-knowledge-items-api"

export { type InformationSharingAgreementKnowledgeItem }

export function useInformationSharingAgreementKnowledgeItem(id: Ref<number | null | undefined>) {
  const state = reactive<{
    informationSharingAgreementKnowledgeItem: InformationSharingAgreementKnowledgeItem | null
    isLoading: boolean
    isErrored: boolean
  }>({
    informationSharingAgreementKnowledgeItem: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<InformationSharingAgreementKnowledgeItem> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { informationSharingAgreementKnowledgeItem } =
        await informationSharingAgreementKnowledgeItemsApi.get(staticId)
      state.isErrored = false
      state.informationSharingAgreementKnowledgeItem = informationSharingAgreementKnowledgeItem
      return informationSharingAgreementKnowledgeItem
    } catch (error) {
      console.error("Failed to fetch information sharing agreement knowledge item:", error)
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
  }
}

export default useInformationSharingAgreementKnowledgeItem
