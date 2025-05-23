<template>
  <h3 class="text-h3 mb-4">Notifications</h3>

  <AppCard>
    <v-btn-toggle
      v-model="showFilter"
      color="info"
      group
      mandatory
      style="border: 1px #b0b0b0 solid !important; border-radius: 6px"
      @update:model-value="page = 1"
    >
      <v-btn
        value="All"
        style="width: 100px; border-left: 1px #b0b0b0 solid"
        text="All"
      />
      <v-btn
        value="Unread"
        style="width: 100px; border-left: 1px #b0b0b0 solid"
        text="Unread"
      />
    </v-btn-toggle>

    <v-list
      class="py-0 mt-4"
      lines="two"
    >
      <v-list-item
        v-for="item in notifications"
        :key="item.id"
        :value="item"
        class="py-4 px-8"
        :base-color="item.readAt ? '' : 'error'"
        @click="markAsRead(item)"
      >
        <template #append>
          <v-btn
            v-if="item.href"
            size="x-small"
            class="mt-0 ml-2 align-top"
            icon="mdi-link-variant"
            :color="!item.readAt ? 'error' : 'success'"
            @click.stop="openNotification(item)"
          ></v-btn>
        </template>
        <p class="text-subtitle-1 font-weight-retular font-italic textSecondary">
          {{ formatDate(item.createdAt) }}
        </p>
        <div>
          <h6 class="text-subtitle-1 font-weight-semibold mb-1">{{ item.title }}</h6>
        </div>
        <p class="text-subtitle-1 font-weight-regular textSecondary">{{ item.subtitle }}</p>
      </v-list-item>
      <RouteQueryPagination
        v-model="page"
        v-model:per-page="perPage"
        :total-count="totalCount"
      />
    </v-list>
  </AppCard>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router"
import { computed, ref, watch } from "vue"
import { isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import notificationsApi from "@/api/notifications-api"

import useNotifications, { NotificationWhereOptions, Notification } from "@/use/use-notifications"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"

import AppCard from "@/components/common/AppCard.vue"
import RouteQueryPagination from "@/components/common/RouteQueryPagination.vue"

const route = useRoute()

const showFilter = ref<string>((route.query.show as string) || "All")
const where = computed<NotificationWhereOptions>(() => {
  if (showFilter.value === "Unread") {
    return { readAt: null }
  }

  return {}
})

const { page, perPage } = useRouteQueryPagination({
  perPage: 5,
})

const notificationsQuery = computed(() => ({
  where: where.value,
  perPage: perPage.value,
  page: page.value,
}))

const { notifications, totalCount } = useNotifications(notificationsQuery)

async function markAsRead(notification: Notification) {
  if (notification.readAt) return

  try {
    const { notification: updatedNotification } = await notificationsApi.update(notification.id, {
      readAt: new Date().toISOString(),
    })
    notification.readAt = updatedNotification.readAt
  } catch (error) {
    console.error(error)
  }
}

const router = useRouter()
async function openNotification(notification: Notification) {
  await markAsRead(notification)

  if (notification.href) {
    router.push(notification.href)
  }
}

watch(
  () => route.query,
  (newQuery) => {
    const isFirstUse = isNil(newQuery.show)
    if (isFirstUse) {
      router.replace({
        query: {
          show: "All",
          page: 1,
          perPage: 5,
        },
      })
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

watch(
  () => showFilter.value,
  () => {
    router.push({
      query: {
        ...route.query,
        show: showFilter.value,
      },
    })
  }
)
</script>
