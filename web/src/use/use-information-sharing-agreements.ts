import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import informationSharingAgreementsApi, {
  type InformationSharingAgreement,
  type InformationSharingAgreementWhereOptions,
  type InformationSharingAgreementFiltersOptions,
  type InformationSharingAgreementQueryOptions,
} from "@/api/information-sharing-agreements-api"

export {
  type InformationSharingAgreement,
  type InformationSharingAgreementWhereOptions,
  type InformationSharingAgreementFiltersOptions,
  type InformationSharingAgreementQueryOptions,
}

export function useInformationSharingAgreements(
  queryOptions: Ref<InformationSharingAgreementQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    informationSharingAgreements: InformationSharingAgreement[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    informationSharingAgreements: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<InformationSharingAgreement[]> {
    state.isLoading = true
    try {
      const { informationSharingAgreements, totalCount } =
        await informationSharingAgreementsApi.list(unref(queryOptions))
      state.isErrored = false
      state.informationSharingAgreements = informationSharingAgreements
      state.totalCount = totalCount
      return informationSharingAgreements
    } catch (error) {
      console.error("Failed to fetch information sharing agreements:", error)
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

export default useInformationSharingAgreements
