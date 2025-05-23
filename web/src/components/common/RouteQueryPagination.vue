<template>
  <v-pagination
    v-model="page"
    :length="totalPages"
  />
</template>

<script lang="ts">
/**
 * Use in conjuction with `useRouteQueryPagination` composable.
 */
</script>

<script setup lang="ts">
import { computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { isNil } from "lodash"

const page = defineModel<number>({
  required: true,
  default: 1,
})

const perPage = defineModel<number>("perPage", {
  default: 10,
})

const props = defineProps<{
  totalCount: number
}>()

const totalPages = computed(() => Math.ceil(props.totalCount / perPage.value))

const route = useRoute()
const router = useRouter()

watch<[number, number], true>(
  () => [page.value, perPage.value],
  ([newPage, newPerPage]) => {
    const isUnchanged =
      newPage.toString() === route.query.page && newPerPage.toString() === route.query.perPage
    if (isUnchanged) {
      return
    }

    const isFirstUse = isNil(route.query.page) || isNil(route.query.perPage)
    if (isFirstUse) {
      router.replace({
        query: {
          ...route.query,
          page: newPage,
          perPage: newPerPage,
        },
      })
      return
    }

    router.push({
      query: {
        ...route.query,
        page: newPage,
        perPage: newPerPage,
      },
    })
  },
  {
    immediate: true,
  }
)
</script>
