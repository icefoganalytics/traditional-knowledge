import { computed, Ref, toValue } from "vue"
import { isNil, isEmpty } from "lodash"

/**
 * Returns a computed ref that returns a specific color class based on the provided color classes.
 * Given
 *    "red" could be used produce "text-red" or "bg-red" or "border-red"
 */
export function useVuetifyColorClassesAsSpecificColorClasses(
  colorClasses: Ref<string>,
  prefix: string = "text"
) {
  const textColorClass = computed(() => {
    const colorClassesValues = toValue(colorClasses)
    if (isNil(colorClassesValues)) return ""
    if (isEmpty(colorClassesValues)) return ""

    const normalizedClass = colorClassesValues.split(" ").join("-")
    return `${prefix}-${normalizedClass}`
  })

  return textColorClass
}

export default useVuetifyColorClassesAsSpecificColorClasses
