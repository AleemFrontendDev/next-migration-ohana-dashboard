import * as yup from "yup";

export const USER_FORMIK = {
  initialValues: {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: 0,
    country: [],
    role: [],
  },
  validationSchema: yup.object({
    account_rejected: yup.bool().required(),
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    // email: yup.string().required(),
    password: yup
      .string()
      .required()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
      ),
    phone: yup.number().required(),
    country: yup.array().required(),
    role: yup.object().required(),
  }),
};

export const UPDATE_USER_FORMIK = {
  initialValues: {
    first_name: "",
    last_name: "",
    email: "",
    phone: 0,
    country: [],
    role: [],
  },
  validationSchema: yup.object({
    account_rejected: yup.bool().required(),
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().required(),
    phone: yup.number().required(),
    country: yup.array().required(),
    role: yup.object().required(),
  }),
};

  export const UPDATE_CUSTOMER_FORMIK = {
    initialValues: {
      first_name: "",
      last_name: "",
      phone: 0,
      // country: 0,
    },
    validationSchema: yup.object({
      account_rejected: yup.bool().required(),
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      phone: yup.number().required(),
      // country: yup.number().required(),
    }),
  };

export const ASSIGN_CURRENCIES_TO_COUNTRY_FORMIK = {
  initialValues: {
    country: [],
    currency: [],
  },
  validationSchema: yup.object({
    country: yup.object().required(),
    currency: yup.array().required(),
  }),
};

export const PAYMENT_GATEWAY_FORMIK = {
  initialValues: {
    activate: true,
    title: "",
    country: [],
    deposite_service_fee: 0,
    withdraw_service_fee: 0,
    deposite_processing_fee: 0,
    withdraw_processing_fee: 0,
  },
  validationSchema: yup.object({
    activate: yup.bool().required(),
    title: yup.string().required(),
    country: yup.array().required(),
    deposite_service_fee: yup.number().required(),
    withdraw_service_fee: yup.number().required(),
    deposite_processing_fee: yup.number().required(),
    withdraw_processing_fee: yup.number().required(),
  }),
};

export const PAYMENT_GATEWAY_TMONEY_FORMIK = {
  initialValues: {
    activate: true,
    title: "",
    country: [],
    deposite_service_fee: 0,
    withdraw_service_fee: 0,
    deposite_processing_fee: 0,
    withdraw_processing_fee: 0,
    // username: "",
    // password: "",
    // base_url: "",
  },
  validationSchema: yup.object({
    activate: yup.bool().required(),
    title: yup.string().required(),
    country: yup.array().required(),
    deposite_service_fee: yup.number().required(),
    withdraw_service_fee: yup.number().required(),
    deposite_processing_fee: yup.number().required(),
    withdraw_processing_fee: yup.number().required(),
    // username: yup.string().required(),
    // password: yup.string().required(),
    // base_url: yup.string().required(),
  }),
};

export const MANUAL_PAYMENT_GATEWAY_FORMIK = {
  initialValues: {
    activate: true,
    title: "",
    mobile_number_1: "",
    mobile_name_1: "",
    mobile_number_2: "",
    mobile_name_2: "",
    account_number: "",
    account_name: "",
    country: [],
    deposit_service_fee: "",
    withdraw_service_fee: "",
    deposit_processing_fee: "",
    withdraw_processing_fee: "",
  },
  validationSchema: yup.object({
    activate: yup.bool().required(),
    title: yup.string().required(),
    mobile_number_1: yup.string().required(),
    mobile_name_1: yup.string().required(),
    mobile_number_2: yup.string().required(),
    mobile_name_2: yup.string().required(),
    account_number: yup.string().required(),
    account_name: yup.string().required(),
    country: yup.object().required(),
    deposit_service_fee: yup.number().required(),
    withdraw_service_fee: yup.number().required(),
    deposit_processing_fee: yup.number().required(),
    withdraw_processing_fee: yup.number().required(),
  }),
};
// { firstname: "", lastname: "", email: "", phone: "", code: "92", password: "" }


export const ORGANIZATION_FORMIK = {
  initialValues: {
    name: "",
    shortname: "",
    description: "",
    admins: [
      { 
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        password: "",
      }
    ]
  },
  validationSchema: yup.object({
    name: yup.string().required("Organization name is required"),
    shortname: yup.string().required("Organization acronym is required"),
    description: yup.string().required("Description is required"),
    admins: yup.array().of(
      yup.object().shape({
        firstname: yup.string().required("First name is required"),
        lastname: yup.string().required("Last name is required"),
        phone: yup.string().required("Phone number is required"),
        email: yup.string().email("Invalid email format").required("Email is required"),
        password: yup.string().required("Password is required"),
      })
    ),
  }),
};