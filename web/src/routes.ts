import { type RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        redirect: "dashboard",
      },
      {
        path: "dashboard",
        name: "DashboardPage",
        component: () => import("@/pages/DashboardPage.vue"),
        meta: { title: "Home" },
      },
      {
        path: "profile",
        name: "ProfilePage",
        component: () => import("@/pages/ProfilePage.vue"),
        meta: { title: "My Profile" },
      },
      {
        name: "NotificationsPage",
        path: "notifications",
        component: () => import("@/pages/NotificationsPage.vue"),
        meta: {
          title: "Notifications",
        },
      },
      {
        path: "administration",
        children: [
          {
            path: "",
            redirect: "/administration/dashboard",
          },
          {
            path: "dashboard",
            name: "administration/DashboardPage",
            component: () => import("@/pages/administration/DashboardPage.vue"),
          },
          {
            path: "groups",
            name: "administration/GroupsPage",
            component: () => import("@/pages/administration/GroupsPage.vue"),
          },
          {
            path: "groups/new",
            name: "administration/groups/GroupNewPage",
            component: () => import("@/pages/administration/groups/GroupNewPage.vue"),
          },
          {
            path: "groups/:groupId",
            component: () => import("@/pages/administration/groups/GroupPage.vue"),
            props: true,
            children: [
              {
                path: "",
                name: "administration/groups/GroupPage",
                redirect: {
                  name: "administration/groups/GroupUsersPage",
                },
              },
              {
                path: "users",
                name: "administration/groups/GroupUsersPage",
                component: () => import("@/pages/administration/groups/GroupUsersPage.vue"),
                props: true,
              },
              {
                path: "users/new",
                name: "administration/groups/GroupUserNewPage",
                component: () => import("@/pages/administration/groups/GroupUserNewPage.vue"),
                props: true,
              },
            ],
          },
          {
            path: "groups/:groupId/edit",
            name: "administration/groups/GroupEditPage",
            component: () => import("@/pages/administration/groups/GroupEditPage.vue"),
            props: true,
          },
          {
            path: "information-sharing-agreements",
            name: "administration/InformationSharingAgreementsPage",
            component: () => import("@/pages/administration/InformationSharingAgreementsPage.vue"),
          },
          {
            path: "information-sharing-agreements/new",
            name: "administration/information-sharing-agreements/InformationSharingAgreementNewPage",
            component: () =>
              import(
                "@/pages/administration/information-sharing-agreements/InformationSharingAgreementNewPage.vue"
              ),
          },
          {
            path: "information-sharing-agreements/:informationSharingAgreementId",
            component: () =>
              import(
                "@/pages/administration/information-sharing-agreements/InformationSharingAgreementPage.vue"
              ),
            props: true,
            children: [
              {
                path: "",
                name: "administration/information-sharing-agreements/InformationSharingAgreementPage",
                redirect: {
                  name: "administration/information-sharing-agreements/InformationSharingAgreementAccessGrantsPage",
                },
              },
              {
                path: "access-grants",
                name: "administration/information-sharing-agreements/InformationSharingAgreementAccessGrantsPage",
                component: () =>
                  import(
                    "@/pages/administration/information-sharing-agreements/InformationSharingAgreementAccessGrantsPage.vue"
                  ),
                props: true,
              },
              {
                path: "access-grants/new",
                name: "administration/information-sharing-agreements/InformationSharingAgreementAccessGrantNewPage",
                component: () =>
                  import(
                    "@/pages/administration/information-sharing-agreements/InformationSharingAgreementAccessGrantNewPage.vue"
                  ),
                props: true,
              },
            ],
          },
          {
            path: "information-sharing-agreements/:informationSharingAgreementId/edit",
            name: "administration/information-sharing-agreements/InformationSharingAgreementEditPage",
            component: () =>
              import(
                "@/pages/administration/information-sharing-agreements/InformationSharingAgreementEditPage.vue"
              ),
            props: true,
          },
          {
            path: "users",
            name: "users/UsersPage",
            component: () => import("@/pages/users/UsersPage.vue"),
          },
          {
            path: "users/new",
            name: "users/UserNewPage",
            component: () => import("@/pages/users/UserNewPage.vue"),
          },
          {
            path: "users/:userId/edit",
            name: "users/UserEditPage",
            component: () => import("@/pages/users/UserEditPage.vue"),
            props: true,
          },
        ],
      },
      {
        path: "archive-items",
        children: [
          {
            path: "",
            name: "archive-item/ArchiveItemListPage",
            component: () => import("@/pages/archive-item/ArchiveItemListPage.vue"),
            meta: { title: "Archive Items" },
            props: true,
          },
          {
            path: "new",
            name: "archive-item/ArchiveItemNewPage",
            component: () => import("@/pages/archive-item/ArchiveItemNewPage.vue"),
            props: true,
          },
          {
            path: ":archiveItemId/view",
            name: "archive-item/ArchiveItemViewPage",
            component: () => import("@/pages/archive-item/ArchiveItemViewPage.vue"),
            props: true,
          },
        ],
      },
    ],
  },
  {
    path: "/sign-in",
    name: "SignInPage",
    component: () => import("@/pages/SignInPage.vue"),
    meta: { requiresAuth: false, title: "Sign In" },
  },
  {
    path: "/status",
    name: "StatusPage",
    component: () => import("@/pages/StatusPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/errors/unauthorized",
    name: "UnauthorizedPage",
    component: () => import("@/pages/UnauthorizedPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFoundPage",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: { requiresAuth: false },
  },
]

export default routes
