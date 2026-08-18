<template>
  <v-select
    v-model="selectedRoles"
    :items="roleItems"
    label="Roles"
    chips
    multiple
    closable-chips
    v-bind="$attrs"
  ></v-select>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import { computed } from "vue"

import { UserRoles } from "@/api/users-api"
import useCurrentUser from "@/use/use-current-user"

const selectedRoles = defineModel<UserRoles[]>({
  default: [],
})

const { t } = useI18n()
const { isSystemAdmin } = useCurrentUser()

const ORDERED_ROLES = [
  UserRoles.USER,
  UserRoles.ADMIN,
  UserRoles.EXTERNAL_ADMIN,
  UserRoles.SYSTEM_ADMIN,
]

// Only a system admin may grant System Admin, matching the back-end guard. See TK-36.
const grantableRoles = computed(() =>
  ORDERED_ROLES.filter((role) => isSystemAdmin.value || role !== UserRoles.SYSTEM_ADMIN)
)

const roleItems = computed(() =>
  grantableRoles.value.map((value) => ({
    title: t(`user.roles.${value}`),
    value,
  }))
)
</script>
