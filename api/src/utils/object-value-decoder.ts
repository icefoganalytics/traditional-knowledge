import { cloneDeepWith } from "lodash"

export function objectValueDecoder<T>(value: T): T {
  return cloneDeepWith(value, (value) => {
    if (typeof value === "string") {
      if (value === "true") return true
      if (value === "false") return false
    }

    return undefined // undefined to let lodash handle the rest without changes
  })
}

export default objectValueDecoder
