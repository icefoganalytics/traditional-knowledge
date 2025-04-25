<template>
  <v-card>
    <v-card-text>
      <div class="d-flex">
        <FilterSearchDebouncedTextField
          v-model="search"
          class="mb-4 mr-5"
          label="Search"
          density="compact"
        />
        <!-- TODO: replace with add user to group link -->
        <v-btn
          color="primary"
          :to="{
            name: 'administration/groups/GroupNewPage',
          }"
          style="height: 40px"
        >
          Add User
        </v-btn>
      </div>

      <UserGroupsAsUsersEditDataTableServer
        :where="where"
        :filters="filters"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import FilterSearchDebouncedTextField from "@/components/common/tables/FilterSearchDebouncedTextField.vue"
import UserGroupsAsUsersEditDataTableServer from "@/components/user-groups/UserGroupsAsUsersEditDataTableServer.vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))
const where = computed(() => ({
  groupId: groupIdAsNumber.value,
}))

const search = ref("")

const filters = computed(() => {
  if (isNil(search.value) || isEmpty(search.value)) return {}

  return {
    searchUser: search.value,
  }
})

useBreadcrumbs("Groups", [ADMIN_CRUMB])
</script>
