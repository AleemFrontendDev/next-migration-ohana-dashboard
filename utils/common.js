'use client'
import { useEffect, useRef } from "react";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const PUSH_KEY =
  "AAAA0gfQO38:APA91bE48Xj8T05y50rlUOY0mkQZxuPcy4AbTlotDwimAKeODNXZWjWBBRXMwtYclc12Kyf2WxAulw_JdaEzTAWw60Fc8e8-3LISmZhsDspepS2wLSnn1irSMKLYhScrk7T_1S-Hj0CX";

export const ROUTES = {
  web: "/",
  orgtransaction: "/org-transactions",
  about: "/about",
  remove_account: "/remove-account",
  leadership: "/leadership",
  careers: "/careers",
  press: "/press",
  terms_conditions: "/terms-conditions",
  login: "/login",
  register: "/register",
  privacy_policy: "/privacy-policy",
  error_404: "/error-404",
  error_500: "/error-500",
  dashboard: "/dashboard",
  organization_dashboard: "/organization_dashboard",
  organization: "/organization",
  organization_detail: "/organization/:id/detail",
  add_organization: "/organization/add-organization",
  edit_organization: "/organization/:id/edit-organization",
  device_update: "/device-update",
  device_update_form: "/device-update-form/:new_device_id/:id",
  group: "/group",
  group_detail: "/group/:id/detail",
  group_users: "/group/:id/users",
  organization_group: "/organization-group",
  add_organization_group: "/organization-group/add-organization-group",
  edit_organization_group: "/organization-group/:id/edit-organization-group",
  pool_contributions: "/group/:id/pool-contributions",
  customer: "/customer",
  customer_id: "/customer/:id",
  edit_customer: "/customer-update/:id/edit",
  // edit_customer: "/customer/edit/:id/edit-customer",

  orgcustomer: "/orgcustomer",
  orgcustomer_id: "/orgcustomer/:id",
  orgappcustomer_id: "/orgappcustomer/:id",

  transactions: "/transactions",
  withdraw_request: "/withdraw-request",
  withdraw_request_id: "/withdraw-request/:id",
  manual_payment: "/manual-payment",
  manual_payment_id: "/manual-payment/:id",
  verify_request: "/verify-request",
  verify_request_id: "/verify-request/:id",
  reports: "/reports",
  support: "/support",

  // roles and permissions for organization
  organization_roles_management: "/organization-roles-management",
  org_roles: "/organization-roles-management/roles",
  add_new_orgrole: "/organization-roles-management/roles/add-new-orgrole",
  org_users: "/organization-roles-management/users",
  add_new_org_user: "/organization-roles-management/users/form/add-user",
  edit_org_user: "/organization-roles-management/users/:id/edit-user",
  edit_org_userwithorgid:
    "/organization-roles-management/:orgId/users/:appId/edit-user",
  orgrole_permissions_id:
    "/organization-roles-management/roles/:id/permissions",
  orgpermissions: "/org-permissions/:id",
  add_new_orgpermission: "/add-new-orgpermission/:id",
  orgwithdraw_request: "/orgwithdraw-request",
  orgwithdraw_request_id: "/orgwithdraw-request/:id",

  // roles and permissions for user
  users_roles_management: "/users-roles-management",
  roles: "/users-roles-management/roles",
  add_new_role: "/users-roles-management/roles/add-new-role",
  role_permissions_id: "/users-roles-management/roles/:id/permissions",
  permissions: "/permissions",
  add_new_permission: "/add-new-permission",
  users: "/users-roles-management/users",
  add_new_user: "/users-roles-management/users/add-new-user",
  edit_user: "/users-roles-management/users/:id/edit-user",
  settings: "/settings",
  payment_gateway: "/settings/payment-gateway",
  add_payment_gateway: "/settings/payment-gateway/add-payment-gateway",
  edit_payment_gateway: "/settings/payment-gateway/:id/edit-payment-gateway",
  manual_payment_gateway: "/settings/manual-payment-gateway",
  add_manual_payment_gateway:
    "/settings/manual-payment-gateway/add-manual-payment-gateway",
  edit_manual_payment_gateway:
    "/settings/manual-payment-gateway/:id/edit-manual-payment-gateway",
  countries: "/settings/countries",
  assign_currencies_to_country:
    "/settings/countries/assign-currencies-to-country",
  edit_currencies_to_country: "/settings/countries/:id/edit",
  currencies: "/settings/currencies",
  // leadership: "/leadership",
  permission_denied: "/permission-denied",
};

export const SECTIONS = [
  "Dashboard",
  "Organizations", // 'Organization
  "Groups",
  "Transactions",
  "Withdraw",
  "Customers",
  "Device Update",
  "Manual Payment",
  "ID Verification",
  "Support",
  "Roles",
  "Users",
  "Payment Gateway",
  "Manual Payment Gateway",
  "Countries",
  "Currencies",
];

export const COLLECTION = {};

export const DOCUMENT = {};

export default function useInterval(callback, delay, ...args) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current(...args);
      }
    }
    if (delay !== null && delay !== undefined) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export const formatAMPM = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, "0");
  let strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

export const formatDate = (dateParam) => {
  let year = dateParam.getFullYear();
  let month = dateParam.getMonth();
  let date = dateParam.getDate();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let strDate = months[month] + " " + date + ", " + year;
  return strDate;
};
