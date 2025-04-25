import { isUndefined } from "lodash"

/**
 * Transforms a string to an integer or returns null if the value is nil.
 */
export const jsonTransformer = {
  get<T>(value: string | undefined): T | undefined {
    if (isUndefined(value) || value === "") return undefined

    return JSON.parse(value)
  },
  set<T>(value: T | undefined): string | undefined {
    if (isUndefined(value)) return undefined

    return JSON.stringify(value)
  },
}

export default jsonTransformer
