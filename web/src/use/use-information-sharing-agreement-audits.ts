import informationSharingAgreementAuditsApi, {
  InformationSharingAgreementAudit,
  InformationSharingAgreementAuditFiltersOptions,
  InformationSharingAgreementAuditWhereOptions,
} from "@/api/information-sharing-agreement-audits-api"
import { reactive, ref, Ref, toRefs, unref, watch } from "vue"

export function useInformationSharingAgreementAudits(
  informationSharingAgreementId: number,
  queryOptions: Ref<{
    where?: InformationSharingAgreementAuditWhereOptions
    filters?: InformationSharingAgreementAuditFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    items: InformationSharingAgreementAudit[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    items: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<InformationSharingAgreementAudit[]> {
    state.isLoading = true
    try {
      const { informationSharingAgreementAudits, totalCount } =
        await informationSharingAgreementAuditsApi.list(
          informationSharingAgreementId,
          unref(queryOptions)
        )
      state.isErrored = false
      state.items = informationSharingAgreementAudits
      state.totalCount = totalCount
      return informationSharingAgreementAudits
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

export default useInformationSharingAgreementAudits
