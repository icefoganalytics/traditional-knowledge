<template>
  <v-autocomplete
    :model-value="modelValue"
    :loading="isLoading"
    :items="allGroups"
    label="Group"
    hint="Search for a group."
    item-value="id"
    auto-select-first
    chips
    clearable
    no-filter
    persistent-hint
    @update:model-value="emit('update:modelValue', $event)"
    @update:search="debouncedUpdateSearchToken"
    @click:clear="reset"
  >
    <template #chip="{ props: chipProps, item: { raw: result } }">
      <GroupChip
        v-if="!isNil(result.id)"
        v-bind="chipProps"
        :group-id="result.id"
      />
      <v-chip
        v-else
        v-bind="chipProps"
        :text="'Unknown#' + JSON.stringify(result)"
      />
    </template>
    <template #item="{ props: itemProps, item: { raw: result } }">
      <GroupListItem
        v-if="!isNil(result.id)"
        v-bind="safeItemProps(itemProps)"
        :group-id="result.id"
      />
      <v-list-item
        v-else
        v-bind="safeItemProps(itemProps)"
        :title="'Unknown#' + (result.id || JSON.stringify(result))"
      />
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
export { type Group, type GroupWhereOptions, type GroupFiltersOptions } from "@/use/use-groups"
</script>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { debounce, isEmpty, isNil, omit, uniqBy } from "lodash"

import useGroup from "@/use/use-group"
import useGroups, {
  type Group,
  type GroupWhereOptions,
  type GroupFiltersOptions,
} from "@/use/use-groups"

import GroupChip from "@/components/groups/GroupChip.vue"
import GroupListItem from "@/components/groups/GroupListItem.vue"

const props = defineProps<{
  modelValue: number | null | undefined
  where?: GroupWhereOptions
  filters?: Omit<GroupFiltersOptions, "search">
}>()

const emit = defineEmits<{
  "update:modelValue": [groupId: number | null | undefined]
}>()

const groupId = computed(() => props.modelValue)
const { group } = useGroup(groupId)

const searchToken = ref("")

function updateSearchToken(value: string) {
  searchToken.value = value
  page.value = 1
}

const debouncedUpdateSearchToken = debounce(updateSearchToken, 500)

const searchFilter = computed(() => {
  if (isNil(searchToken.value) || isEmpty(searchToken.value)) return {}

  return {
    search: searchToken.value,
  }
})

const perPage = computed(() => {
  if (isNil(searchToken.value) || isEmpty(searchToken.value)) return 100

  return 20
})

const page = ref(1)

const groupsQuery = computed<{
  where?: GroupWhereOptions
  filters?: GroupFiltersOptions
  perPage: number
}>(() => {
  return {
    where: props.where,
    filters: {
      ...props.filters,
      ...searchFilter.value,
    },
    perPage: perPage.value,
    page: page.value,
  }
})
const { groups, totalCount, isLoading, refresh } = useGroups(groupsQuery)

const allGroups = computed<Group[]>(() => {
  if (isNil(group.value)) {
    return groups.value
  }

  return uniqBy([...groups.value, group.value], "id")
})

/**
 * Title is an attribute of the Group object, which overrides the title in the list item, so title must be removed.
 */
function safeItemProps(itemProps: Record<string, unknown>) {
  return omit(itemProps, ["title"])
}

async function reset() {
  searchToken.value = ""
  group.value = null
  await refresh()
}

watch(
  () => props.modelValue,
  async (newModelValue) => {
    if (isEmpty(newModelValue)) {
      await reset()
    }
  }
)

const hasMore = computed(() => page.value * perPage.value < totalCount.value)

function nextPage() {
  page.value += 1
}

defineExpose({
  reset,
})
</script>
