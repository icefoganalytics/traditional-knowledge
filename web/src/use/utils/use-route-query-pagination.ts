import { useRouteQuery } from "@vueuse/router"

import { integerTransformer } from "@/utils/use-route-query-transformers"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10

/**
 * Usage: use in conjunction with RouteQueryPagination component.
 * @param {Object} [options] - Options object.
 * @param {number} [options.page=1] - Initial page number. Default is 1.
 * @param {number} [options.perPage=10] - Initial items per page. Default is 10.
 */
export function useRouteQueryPagination({
  page = DEFAULT_PAGE,
  perPage = DEFAULT_PER_PAGE,
  routeQuerySuffix = "",
}: {
  page?: number
  perPage?: number
  routeQuerySuffix?: string
} = {}) {
  const queryPage = useRouteQuery<string, number>(`page${routeQuerySuffix}`, page.toString(), {
    transform: integerTransformer,
  })

  const queryPerPage = useRouteQuery<string, number>(
    `perPage${routeQuerySuffix}`,
    perPage.toString(),
    {
      transform: integerTransformer,
    }
  )

  return {
    page: queryPage,
    perPage: queryPerPage,
  }
}

export default useRouteQueryPagination
