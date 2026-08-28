import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import informationSharingAgreementArchiveItemsApi, {
  type InformationSharingAgreementArchiveItem,
} from "@/api/information-sharing-agreement-archive-items-api"

export { type InformationSharingAgreementArchiveItem }

export function useInformationSharingAgreementArchiveItem(
  id: Ref<number | null | undefined>
) {
  const state = reactive<{
    informationSharingAgreementArchiveItem: InformationSharingAgreementArchiveItem | null
    isLoading: boolean
    isErrored: boolean
  }>({
    informationSharingAgreementArchiveItem: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<InformationSharingAgreementArchiveItem> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { informationSharingAgreementArchiveItem } =
        await informationSharingAgreementArchiveItemsApi.get(staticId)
      state.isErrored = false
      state.informationSharingAgreementArchiveItem = informationSharingAgreementArchiveItem
      return informationSharingAgreementArchiveItem
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

export default useInformationSharingAgreementArchiveItem
