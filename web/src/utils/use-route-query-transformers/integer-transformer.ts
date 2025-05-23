import { isNil } from "lodash"

export const integerTransformer = {
  get(value: number | string | null | undefined): number {
    if (isNil(value)) return 0
    if (typeof value === "number") return value

    return parseInt(value, 10)
  },
  set(value: number): string {
    return String(value)
  },
}

export default integerTransformer
