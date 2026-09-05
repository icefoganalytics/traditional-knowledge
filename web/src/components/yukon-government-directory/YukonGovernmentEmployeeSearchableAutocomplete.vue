<template>
  <v-autocomplete
    :model-value="modelValue"
    :loading="isLoading"
    :items="allItems"
    :label="label"
    placeholder="Start typing name or email..."
    :hint="hint"
    item-value="email"
    item-title="email"
    prepend-inner-icon="mdi-magnify"
    auto-select-first
    clearable
    no-filter
    persistent-hint
    persistent-clear
    @update:model-value="emitModelValueAndSelection"
    @update:search="debouncedUpdateSearchToken"
    @click:clear="reset"
  >
    <template #item="{ props: itemProps, item: { raw: employee } }">
      <v-list-item v-bind="itemProps">
        <v-list-item-title>{{ employee.displayName }}</v-list-item-title>
        <v-list-item-subtitle>{{ employee.email }}</v-list-item-subtitle>
        <v-list-item-subtitle v-if="employee.title">
          {{ employee.title }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template
      v-if="hasMore"
      #append-item
    >
      <v-divider />
      <v-list-item
        class="text-primary text-center"
        title="Show More"
        @click="nextPage"
      />
    </template>
  </v-autocomplete>
</template>

<!-- Special module scope (non-setup) required for exports -->
<script lang="ts">
export { type YukonGovernmentEmployee } from "@/api/yukon-government-directory/employees-api"
</script>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { debounce, isEmpty, isNil, uniqBy } from "lodash"

import useYukonGovernmentEmployees, {
  type YukonGovernmentEmployee,
  type YukonGovernmentEmployeeQueryOptions,
} from "@/use/yukon-government-directory/use-yukon-government-employees"

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined
    label?: string
    hint?: string
  }>(),
  {
    label: "Search Active Directory",
    hint: "Pre-populates user information directly from the directory.",
  }
)

const emit = defineEmits<{
  "update:modelValue": [email: string | null | undefined]
  selected: [employee: YukonGovernmentEmployee]
}>()

function emitModelValueAndSelection(email: string | null | undefined) {
  emit("update:modelValue", email)

  if (isNil(email) || isEmpty(email)) return

  const selectedEmployee = allItems.value.find((employee) => employee.email === email)
  if (isNil(selectedEmployee)) return

  emit("selected", selectedEmployee)
}

const searchToken = ref("")

function updateSearchToken(value: string) {
  searchToken.value = value
  page.value = 1
}

const debouncedUpdateSearchToken = debounce(updateSearchToken, 500)

const page = ref(1)

const employeesQuery = computed<YukonGovernmentEmployeeQueryOptions>(() => ({
  where: {
    email: searchToken.value,
  },
  perPage: 20,
  page: page.value,
}))
const {
  employees,
  totalCount,
  isLoading,
  reset: resetEmployees,
} = useYukonGovernmentEmployees(employeesQuery, {
  skipWatchIf: () =>
    isNil(searchToken.value) || isEmpty(searchToken.value) || searchToken.value.length < 3,
})

const allItems = computed<YukonGovernmentEmployee[]>(() => {
  if (isNil(props.modelValue) || isEmpty(props.modelValue)) return employees.value

  return uniqBy(employees.value, "email")
})

async function reset() {
  searchToken.value = ""
  page.value = 1
  resetEmployees()
}

watch(
  () => props.modelValue,
  async (newValue) => {
    if (isEmpty(newValue)) {
      await reset()
    }
  }
)

const hasMore = computed(() => page.value * 20 < totalCount.value)

function nextPage() {
  page.value += 1
}

defineExpose({
  reset,
})
</script>
