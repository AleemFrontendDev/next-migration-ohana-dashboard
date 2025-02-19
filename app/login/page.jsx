'use client'
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Form } from "react-bootstrap";
import db from "@/firebase/firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import Footer from "@/components/layout/Footer/Footer";
import { BASE_URL, ROUTES } from "@/utils/common";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { useAuthToken } from "@/utils/useAuthToken";

export default function Login() {
  const authToken = useAuthToken();
  console.log(authToken)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailWrong, setEmailWrong] = useState("");
  const [passwordWrong, setPasswordWrong] = useState("");
  const [error, setError] = useState("");
  const history = useRouter();
  const { countryChange } = useCountry();
  const { userChange } = useUser();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "Ohana-Agent-oo73",       
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      const jsonData = await response.json();
      console.log("Login Api Response: ", jsonData);
      if (jsonData.success) {
        localStorage.setItem("auth_token", jsonData.bearer);
        const user = jsonData.user;
        console.log("User: ", user);
        if (user.account_rejected !== 0) {
          setError("Your Account has been rejected!");
          signOut(db.auth)
            .then(async () => {
              localStorage.removeItem("auth_token");
              const response = await fetch(`${BASE_URL}/logout`, {
                method: "get",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": "Ohana-Agent-oo73",       
                  Authorization: jsonData.bearer,
                },
              });
              const responseJsonData = await response.json();
              if (responseJsonData.success) {
                localStorage.removeItem("Auth Token");
                history.push("/login");
              }
            })
            .catch((error) => {
              setError(error);
            });
        } else {
          setError("");
          localStorage.setItem("Auth Token", jsonData.bearer);
          const loggedInUser = localStorage.getItem("loggedInUser");
          if (!user.role_id) {
            if (!loggedInUser || loggedInUser.email !== email) {
              localStorage.setItem("loggedInUser", JSON.stringify(user));
              userChange(user);
            }
            history.push(ROUTES.dashboard);
          } else {
            if (!loggedInUser || loggedInUser.email !== email) {
              var country;
              if (user.selected_country) {
                country = user.countries.filter(
                  (country) => country.id == user.selected_country
                )[0];
              } else {
                country = user.countries[0];
              }
              countryChange(country.id);
              const local_storage = {
                id: country.id,
                flag: country.flag,
                name: country.nicename,
              };
              localStorage.setItem(
                "selectedCountry",
                JSON.stringify(local_storage)
              );
              localStorage.setItem("loggedInUser", JSON.stringify(user));

              console.log("user loggin krne ke bad ")
              userChange(user);
            }
            getUSDRateApi();
            console.log("working 100")

            if (user.role.status == true) {
              const permissionsList = user.role.permissions.map(
                (doc) => doc.section
              );
              console.log("permissionsList", permissionsList);
              const findSection = (term) => {
                if (permissionsList.includes(term)) {
                  return permissionsList;
                }
              };
              switch (permissionsList) {
                case findSection("Dashboard"):
                  return history.push(ROUTES.dashboard);
                case findSection("Organizations"):
                  return history.push(ROUTES.organization);
                case findSection("Organization Dashboard"):
                  return history.push(ROUTES.organization_dashboard);
                case findSection("Groups"):
                  return history.push(ROUTES.group);
                case findSection("Transactions"):
                  return history.push(ROUTES.transactions);
                case findSection("Withdraw"):
                  return history.push(ROUTES.withdraw_request); 
                case findSection("Reports"):
                  return history.push(ROUTES.reports);
                case findSection("Customers"):
                  return history.push(ROUTES.customer);
                case findSection("Manual Payment"):
                  return history.push(ROUTES.manual_payment);
                case findSection("ID Verification"):
                  return history.push(ROUTES.verify_request);
                case findSection("Support"):
                  return history.push(ROUTES.support);
                case findSection("Roles"):
                  return history.push(ROUTES.roles);
                case findSection("Users"):
                  return history.push(ROUTES.users);
                case findSection("Payment Gateway"):
                  return history.push(ROUTES.payment_gateway);
                case findSection("Countries"):
                  return history.push(ROUTES.countries);
                default:
                  return history.push(ROUTES.permission_denied);
              }
            } else {
              return history.push(ROUTES.permission_denied);
            }
          }
        }
      } else {
        setError(jsonData.message);
      }
    } catch (error) {
      console.log("Error in Login", error);
      setError(error?.message || "Error in Login");
    }
    await getUSDRateApi();
  };

  const getUSDRateApi = async () => {
    const rate = await fetch(`${BASE_URL}/getUSDRate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
    });
    const rates = await rate.json();
    console.log("getUSDRate Api Response", rates);
    localStorage.setItem("usd_rates", JSON.stringify(rates.rates));
  };
  return (
    <div className="main-panel h-full">
      <div className="content-wrapper">
        <div className="flex items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="flex items-center justify-center w-full">
              <div className="flex flex-col gap-4 bg-white text-left py-5 px-4 w-[480px] h-[405px]">
                <div className="brand-logo text-center text-dark">
                  <h3 className="font-bold">Ohana.Africa</h3>
                </div>
                <h6 className="font-thin text-[#343a40] mt-3">Sign in to continue.</h6>
                {error ? (
                  <span className="alert alert-danger">{error}</span>
                ) : (
                  ""
                )}
                <Form className="pt-3 flex flex-col gap-1" onSubmit={onSubmit}>
                  {emailWrong ? (
                    <small className="text-danger">{emailWrong}</small>
                  ) : (
                    ""
                  )}
                  <Form.Group className="d-flex search-field">
                    <Form.Control
                      type="email"
                      placeholder="Username"
                      size="lg"
                      className={emailWrong ? "border-danger" : "border-[#dee2e6] text-[#dee2e6] h-[50px] text-sm rounded-none"}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  {passwordWrong ? (
                    <small className="text-danger">{passwordWrong}</small>
                  ) : (
                    ""
                  )}
                  <Form.Group className="d-flex search-field">
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      size="lg"
                      className={passwordWrong ? "border-danger" : "border-[#dee2e6] text-[#dee2e6] h-[50px] text-sm rounded-none"}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>
                  <div className="">
                    <button
                      className="btn btn-block btn-warning btn-lg font-weight-medium auth-form-btn text-sm h-[50px] bg-[#ffaf00] text-white rounded-none"
                      onClick={onSubmit}
                    >
                      SIGN IN
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
