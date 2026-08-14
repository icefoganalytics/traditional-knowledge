<template>
  <v-skeleton-loader
    v-if="isNil(user)"
    type="chip"
  />
  <v-chip
    v-else
    v-bind="$attrs"
    :loading="isLoading"
    variant="text"
    :class="classes"
    :size="size"
    color="primary"
    style="height: 18px; border-radius: 4px; padding-left: 4px; padding-right: 8px"
  >
    <strong
      class="text-primary"
      style="font-weight: 600; font-size: 14px"
      >{{ userTitle }}</strong
    >
    <v-icon
      right
      size="large"
      >mdi-menu-down</v-icon
    >
    <v-menu
      activator="parent"
      :close-on-content-click="false"
    >
      <v-card
        class="mx-auto"
        max-width="450"
        :title="userTitle"
        :subtitle="user.title || user.email"
      >
        <template #prepend>
          <v-avatar color="blue-darken-2">
            <v-img
              :alt="userTitle"
              :src="gravatarUrl"
            />
          </v-avatar>
        </template>
        <template
          v-if="!isNil(userProfileLink)"
          #append
        >
          <v-btn
            class="ml-2"
            size="x-small"
            icon="mdi-link"
            variant="outlined"
            :to="userProfileLink"
          />
        </template>
        <v-card-text>
          <v-row
            class="mt-0"
            dense
          >
            <v-col
              v-if="!isNil(user.externalOrganization)"
              cols="12"
            >
              Yukon First Nation or Indigenous Government:
              <strong>{{ user.externalOrganization.name }}</strong>
            </v-col>
            <v-col
              v-if="!isEmpty(user.department)"
              cols="12"
            >
              Department: <strong>{{ user.department }}</strong>
            </v-col>
            <v-col
              v-if="!isEmpty(user.division)"
              cols="12"
            >
              Division: <strong>{{ user.division }}</strong>
            </v-col>
            <v-col
              v-if="!isEmpty(user.branch)"
              cols="12"
            >
              Branch: <strong>{{ user.branch }}</strong>
            </v-col>
            <v-col
              v-if="!isEmpty(user.unit)"
              cols="12"
            >
              Unit: <strong>{{ user.unit }}</strong>
            </v-col>
            <v-col cols="12">
              Email: <strong>{{ user.email }}</strong>
              <v-btn
                class="ml-2"
                title="Copy email address"
                size="x-small"
                color="primary"
                icon="mdi-content-copy"
                variant="text"
                @click="copyToEmailClipboard"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-chip>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isEmpty, isNil } from "lodash"
import md5 from "md5"

import { VChip } from "vuetify/components"

import useUser from "@/use/use-user"
import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"

const props = withDefaults(
  defineProps<{
    userId: number | null
    classes?: Record<string, boolean> | string[] | string
    size?: VChip["size"]
  }>(),
  {
    classes: "cursor-pointer",
    size: "large",
  }
)

const { userId } = toRefs(props)
const { user, isLoading } = useUser(userId)

const { currentUser, canManageInternalUsers, canManageExternalUsers } = useCurrentUser<true>()

// Mirrors User#canManageUser on the back end. See TK-36.
function canManage(target: { isExternal: boolean }) {
  return target.isExternal ? canManageExternalUsers.value : canManageInternalUsers.value
}

const userTitle = computed(() => {
  if (isNil(user.value)) return ""

  const displayName =
    user.value.displayName ?? [user.value.firstName, user.value.lastName].filter(Boolean).join(" ")
  if (isEmpty(displayName)) return "Unknown"

  return displayName
})

// TODO: consider loading user profile picture from ActiveDirectory
// e.g. GET - https://graph.microsoft.com/v1.0/users/:externalDirectoryId/photo/$value
const gravatarUrl = computed(() => {
  if (isNil(user.value?.email)) {
    return ""
  }

  const normalizedEmail = user.value?.email.trim().toLowerCase()
  const hash = md5(normalizedEmail)
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`
})

const userProfileLink = computed(() => {
  if (currentUser.value.id === userId.value) {
    return {
      name: "ProfilePage",
    }
  }

  // External users live on a different edit page, so route by the user's own type
  // rather than always assuming internal. See TK-36.
  if (!isNil(user.value) && canManage(user.value)) {
    return {
      name: user.value.isExternal
        ? "users/UserExternalEditPage"
        : "users/UserInternalEditPage",
      params: {
        userId: userId.value,
      },
    }
  }

  return null
})

const snack = useSnack()

async function copyToEmailClipboard() {
  if (isNil(user.value?.email)) {
    return
  }

  await navigator.clipboard.writeText(user.value.email)
  snack.success("Email copied!")
}
</script>

<style scoped>
.v-chip:hover {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}
</style>
