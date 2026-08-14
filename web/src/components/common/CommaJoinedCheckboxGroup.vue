<template>
  <div>
    <v-checkbox
      v-for="option of options"
      :key="option.value"
      :model-value="selectedValues.includes(option.value)"
      :label="option.label"
      density="compact"
      hide-details
      @update:model-value="toggle(option.value, $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { isEmpty, isNil } from "lodash"

export type CheckboxOption = {
  value: string
  label: string
}

/**
 * Renders a comma-joined column as a checkbox list. The columns backing the optional
 * agreement sections store their selections as a single delimited string. See TK-44.
 */
const modelValue = defineModel<string | null | undefined>()

defineProps<{
  options: CheckboxOption[]
}>()

const selectedValues = computed<string[]>(() => {
  if (isNil(modelValue.value) || isEmpty(modelValue.value)) return []

  return modelValue.value.split(",")
})

function toggle(value: string, isSelected: boolean | null) {
  const remaining = selectedValues.value.filter((selected) => selected !== value)
  const updated = isSelected === true ? [...remaining, value] : remaining

  modelValue.value = isEmpty(updated) ? null : updated.join(",")
}
</script>
