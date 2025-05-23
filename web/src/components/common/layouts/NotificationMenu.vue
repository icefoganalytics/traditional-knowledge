<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false"
    class="notification_popup"
  >
    <template #activator="{ props }">
      <v-btn
        icon
        v-bind="props"
      >
        <v-badge
          v-if="totalCountUnreadNotifications > 0"
          color="error"
          :content="totalCountUnreadNotifications"
        >
          <v-icon
            size="24"
            color="white"
            icon="mdi-bell"
          />
        </v-badge>
        <v-icon
          v-else
          size="24"
          color="white"
          icon="mdi-bell"
        />
      </v-btn>
    </template>
    <v-sheet
      rounded="md"
      width="390"
      elevation="11"
    >
      <div class="px-8 pb-4 pt-6">
        <div class="d-flex align-center justify-space-between">
          <h6 class="text-h5">Notifications</h6>
          <div>
            <v-chip
              :color="hasUnreadNotifications ? 'error' : 'success'"
              variant="flat"
              size="small"
              class="text-white mr-2"
            >
              {{ totalCountUnreadNotifications }} Unread
            </v-chip>
            <v-chip
              color="info"
              variant="flat"
              size="small"
              class="text-white"
            >
              {{ totalCountTodaysNotifications }} Today
            </v-chip>
          </div>
        </div>
        <p class="text-subtitle-2 font-weight-regular">
          {{ latestNotifications.length }} Most Recent
        </p>
        <v-divider />
      </div>
      <div style="max-height: 400px; overflow-y: scroll">
        <v-list
          class="py-0"
          lines="two"
        >
          <v-list-item
            v-for="notification in latestNotifications"
            :key="notification.id"
            class="py-4 px-8"
            :base-color="notification.readAt ? '' : 'error'"
            @click="markAsRead(notification)"
          >
            <template #append>
              <v-btn
                v-if="notification.href"
                size="x-small"
                class="mt-0 ml-2 align-top"
                icon="mdi-link-variant"
                :color="!notification.readAt ? 'error' : 'success'"
                @click.stop="openNotification(notification)"
              />
            </template>
            <p class="text-subtitle-1 font-weight-retular font-italic textSecondary">
              {{ formatDate(notification.createdAt) }}
            </p>
            <div>
              <h6 class="text-subtitle-1 font-weight-semibold mb-1">{{ notification.title }}</h6>
            </div>
            <p class="text-subtitle-1 font-weight-regular textSecondary">
              {{ notification.subtitle }}
            </p>
          </v-list-item>
          <v-divider></v-divider>
        </v-list>
      </div>
      <div class="py-4 px-6 text-center">
        <v-btn
          variant="outlined"
          block
          :to="{ name: 'NotificationsPage' }"
          text="See all Notifications"
          @click="showMenu = false"
        />
      </div>
    </v-sheet>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { formatDate } from "@/utils/formatters"

import notificationsApi, { type Notification } from "@/api/notifications-api"

import { CURRENT_USERS_TIMEZONE } from "@/use/use-current-user"
import useNotifications from "@/use/use-notifications"

const latestNotificationsQuery = computed(() => ({
  perPage: 5,
}))

const { notifications: latestNotifications, refresh: refreshLatestNotifications } =
  useNotifications(latestNotificationsQuery)

const unreadNotificationsQuery = computed(() => ({
  where: {
    readAt: null,
  },
  perPage: 1, // we only care about the total count
}))

const { totalCount: totalCountUnreadNotifications, refresh: refreshUnreadNotifications } =
  useNotifications(unreadNotificationsQuery)
const hasUnreadNotifications = computed(() => totalCountUnreadNotifications.value > 0)

const todaysNotificationsQuery = computed(() => ({
  filters: {
    createdTodayInUserTimezone: CURRENT_USERS_TIMEZONE,
  },
  perPage: 1, // we only care about the total count
}))

const { totalCount: totalCountTodaysNotifications, refresh: refreshTodaysNotifications } =
  useNotifications(todaysNotificationsQuery)

async function refresh() {
  await refreshLatestNotifications()
  await refreshUnreadNotifications()
  await refreshTodaysNotifications()
}

async function markAsRead(notification: Notification) {
  if (notification.readAt) return

  try {
    const { notification: updatedNotification } = await notificationsApi.update(notification.id, {
      readAt: new Date().toISOString(),
    })
    notification.readAt = updatedNotification.readAt
    refresh()
  } catch (error) {
    console.error(error)
  }
}

const router = useRouter()

async function openNotification(notification: Notification) {
  await markAsRead(notification)
  // non-blocking refresh, because this is a layout component
  // the refresh will not be aborted by the redirect
  refresh()

  if (notification.href) {
    showMenu.value = false
    await router.push(notification.href)
  }
}

const showMenu = ref(false)
</script>
