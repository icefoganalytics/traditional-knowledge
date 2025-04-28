<template>
  <v-autocomplete
    :model-value="modelValue"
    :loading="isLoading"
    :items="allUsers"
    label="User"
    hint="Search for a user."
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
      <UserChip
        v-if="!isNil(result.id)"
        v-bind="chipProps"
        :user-id="result.id"
      />
      <v-chip
        v-else
        v-bind="chipProps"
        :text="'Unknown#' + JSON.stringify(result)"
      />
    </template>
    <template #item="{ props: itemProps, item: { raw: result } }">
      <UserListItem
        v-if="!isNil(result.id)"
        v-bind="safeItemProps(itemProps)"
        :user-id="result.id"
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
export { type User, type UserWhereOptions, type UserFiltersOptions } from "@/use/use-users"
</script>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { debounce, isEmpty, isNil, omit, uniqBy } from "lodash"

import useUser from "@/use/use-user"
import useUsers, {
  type User,
  type UserWhereOptions,
  type UserFiltersOptions,
} from "@/use/use-users"

import UserChip from "@/components/users/UserChip.vue"
import UserListItem from "@/components/users/UserListItem.vue"

const props = defineProps<{
  modelValue: number | null | undefined
  where?: UserWhereOptions
  filters?: Omit<UserFiltersOptions, "search">
}>()

const emit = defineEmits<{
  "update:modelValue": [userId: number | null | undefined]
}>()

const userId = computed(() => props.modelValue)
const { user } = useUser(userId)

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

const usersQuery = computed<{
  where?: UserWhereOptions
  filters?: UserFiltersOptions
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
const { users, totalCount, isLoading, refresh } = useUsers(usersQuery)

const allUsers = computed<User[]>(() => {
  if (isNil(user.value)) {
    return users.value
  }

  return uniqBy([...users.value, user.value], "id")
})

/**
 * Title is an attribute of the User object, which overrides the title in the list item, so title must be removed.
 */
function safeItemProps(itemProps: Record<string, unknown>) {
  return omit(itemProps, ["title"])
}

async function reset() {
  searchToken.value = ""
  user.value = null
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
