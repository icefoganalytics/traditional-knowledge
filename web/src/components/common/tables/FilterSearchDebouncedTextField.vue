<template>
  <v-text-field
    v-model="search"
    label="Search"
    clearable
    hide-details
  />
</template>

<script setup lang="ts">
import { watch } from "vue"
import { debounce } from "lodash"
import { useRouteQuery } from "@vueuse/router"

import { stringTransformer } from "@/utils/use-route-query-transformers"

const loaded = defineModel<boolean>("loaded", {
  default: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: string
    routeQuerySuffix?: string
  }>(),
  {
    routeQuerySuffix: "",
  }
)

const emit = defineEmits<{
  "update:modelValue": [search: string]
}>()

const search = useRouteQuery<string, string>(`search${props.routeQuerySuffix}`, "", {
  transform: stringTransformer,
})

function emitSearchUpdate(newSearch: string) {
  emit("update:modelValue", newSearch)
}

const debouncedEmitSearchUpdate = debounce(emitSearchUpdate, 500)

watch(
  () => search.value,
  (newSearch, oldSearch) => {
    if (loaded.value === false && oldSearch === undefined) {
      loaded.value = true
      emitSearchUpdate(newSearch)
    } else {
      debouncedEmitSearchUpdate(newSearch)
    }
  },
  {
    immediate: true,
  }
)
</script>
