import { type RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "SignInPage",
    component: () => import("@/pages/SignInPage.vue"),
    meta: { requiresAuth: false, title: "Sign In" },
  },
  {
    path: "/callback",
    name: "CallbackPage",
    component: () => import("@/pages/CallbackPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      /* {
        path: "",
        redirect: "dashboard",
      }, */
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
        path: "information-sharing-agreements",
        name: "InformationSharingAgreementsPage",
        component: () => import("@/pages/InformationSharingAgreementsPage.vue"),
      },
      {
        path: "information-sharing-agreements/new",
        name: "information-sharing-agreements/InformationSharingAgreementNewPage",
        component: () =>
          import("@/pages/information-sharing-agreements/InformationSharingAgreementNewPage.vue"),
      },
      {
        path: "information-sharing-agreements/:informationSharingAgreementId",
        name: "information-sharing-agreements/InformationSharingAgreementPage",
        component: () =>
          import("@/pages/information-sharing-agreements/InformationSharingAgreementPage.vue"),
        props: true,
      },
      {
        path: "information-sharing-agreements/:informationSharingAgreementId/sign",
        name: "information-sharing-agreements/InformationSharingAgreementSignPage",
        component: () =>
          import("@/pages/information-sharing-agreements/InformationSharingAgreementSignPage.vue"),
        props: true,
      },
      {
        path: "information-sharing-agreements/:informationSharingAgreementId/edit",
        component: () => import("@/layouts/InformationSharingAgreementEditLayout.vue"),
        props: true,
        children: [
          {
            path: "",
            name: "information-sharing-agreements/InformationSharingAgreementEditPage",
            component: () =>
              import("@/pages/information-sharing-agreements/InformationSharingAgreementEditPage.vue"),
            props: true,
          },
          {
            path: "edit-basic-information",
            name: "information-sharing-agreements/InformationSharingAgreementEditBasicInformationPage",
            component: () =>
              import("@/pages/information-sharing-agreements/InformationSharingAgreementEditBasicInformationPage.vue"),
            props: true,
          },
          {
            path: "edit-duration",
            name: "information-sharing-agreements/InformationSharingAgreementEditDurationPage",
            component: () =>
              import("@/pages/information-sharing-agreements/InformationSharingAgreementEditDurationPage.vue"),
            props: true,
          },
          {
            path: "edit-access",
            name: "information-sharing-agreements/InformationSharingAgreementEditAccessPage",
            component: () =>
              import("@/pages/information-sharing-agreements/InformationSharingAgreementEditAccessPage.vue"),
            props: true,
          },
          {
            path: "edit-confidentiality",
            name: "information-sharing-agreements/InformationSharingAgreementEditConfidentialityPage",
            component: () =>
              import("@/pages/information-sharing-agreements/InformationSharingAgreementEditConfidentialityPage.vue"),
            props: true,
          },
        ],
      },
      {
        path: "information-sharing-agreements/:informationSharingAgreementId/archive-items/new",
        name: "information-sharing-agreements/archive-items/InformationSharingAgreementArchiveItemNewPage",
        component: () =>
          import("@/pages/information-sharing-agreements/archive-items/InformationSharingAgreementArchiveItemNewPage.vue"),
        props: true,
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
            path: "retentions",
            name: "administration/RetentionsPage",
            component: () => import("@/pages/administration/RetentionsPage.vue"),
          },
          {
            path: "retentions/new",
            name: "administration/RetentionNewPage",
            component: () => import("@/pages/administration/retentions/RetentionNewPage.vue"),
          },
          {
            path: "retentions/:retentionId/edit",
            name: "administration/RetentionEditPage",
            component: () => import("@/pages/administration/retentions/RetentionEditPage.vue"),
            props: true,
          },
          {
            path: "categories",
            name: "administration/CategoriesPage",
            component: () => import("@/pages/administration/CategoriesPage.vue"),
          },
          {
            path: "categories/new",
            name: "administration/CategoryNewPage",
            component: () => import("@/pages/administration/categories/CategoryNewPage.vue"),
          },
          {
            path: "categories/:categoryId/edit",
            name: "administration/CategoryEditPage",
            component: () => import("@/pages/administration/categories/CategoryEditPage.vue"),
            props: true,
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
              import("@/pages/administration/information-sharing-agreements/InformationSharingAgreementNewPage.vue"),
          },
          {
            path: "information-sharing-agreements/:informationSharingAgreementId",
            component: () =>
              import("@/pages/administration/information-sharing-agreements/InformationSharingAgreementPage.vue"),
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
                  import("@/pages/administration/information-sharing-agreements/InformationSharingAgreementAccessGrantsPage.vue"),
                props: true,
              },
              {
                path: "access-grants/new",
                name: "administration/information-sharing-agreements/InformationSharingAgreementAccessGrantNewPage",
                component: () =>
                  import("@/pages/administration/information-sharing-agreements/InformationSharingAgreementAccessGrantNewPage.vue"),
                props: true,
              },
            ],
          },
          {
            path: "information-sharing-agreements/:informationSharingAgreementId/edit",
            name: "administration/information-sharing-agreements/InformationSharingAgreementEditPage",
            component: () =>
              import("@/pages/administration/information-sharing-agreements/InformationSharingAgreementEditPage.vue"),
            props: true,
          },
          {
            path: "users",
            name: "users/UsersPage",
            component: () => import("@/pages/users/UsersPage.vue"),
          },
          {
            path: "users/internal-new",
            name: "users/UserInternalNewPage",
            component: () => import("@/pages/users/UserInternalNewPage.vue"),
          },
          {
            path: "users/external-new",
            name: "users/UserExternalNewPage",
            component: () => import("@/pages/users/UserExternalNewPage.vue"),
          },
          {
            path: "external-organizations",
            name: "admin/ExternalOrganizationsPage",
            component: () =>
              import("@/pages/admin/external-organizations/ExternalOrganizationsPage.vue"),
          },
          {
            path: "external-organizations/new",
            name: "admin/ExternalOrganizationsNewPage",
            component: () =>
              import("@/pages/admin/external-organizations/ExternalOrganizationsNewPage.vue"),
          },
          {
            path: "external-organizations/:externalOrganizationId/edit",
            name: "admin/ExternalOrganizationsEditPage",
            component: () =>
              import("@/pages/admin/external-organizations/ExternalOrganizationsEditPage.vue"),
            props: true,
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
        name: "archive-items/ArchiveItemListPage",
        component: () => import("@/pages/archive-items/ArchiveItemListPage.vue"),
        meta: { title: "Traditional Knowledge" },
        props: true,
      },
      {
        path: "archive-items/new",
        name: "archive-items/ArchiveItemNewPage",
        component: () => import("@/pages/archive-items/ArchiveItemNewPage.vue"),
        props: true,
      },
      {
        path: "archive-items/:archiveItemId",
        component: () => import("@/pages/archive-items/ArchiveItemPage.vue"),
        props: true,
        children: [
          {
            path: "",
            name: "archive-items/ArchiveItemPage",
            redirect: {
              name: "archive-items/ArchiveItemInformationSharingAgreementsPage",
            },
          },

          {
            path: "information-sharing-agreements",
            name: "archive-items/ArchiveItemInformationSharingAgreementsPage",
            component: () =>
              import("@/pages/archive-items/ArchiveItemInformationSharingAgreementsPage.vue"),
            props: true,
          },
          {
            path: "users-with-access",
            name: "archive-items/ArchiveItemUsersWithAccessPage",
            component: () => import("@/pages/archive-items/ArchiveItemUsersWithAccessPage.vue"),
            props: true,
          },
        ],
      },
    ],
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
