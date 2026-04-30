import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

// ── Reusable inline error component ──────────────────────────────
const FieldError = ({ msg }) =>
    msg ? <p className="text-red-500 text-xs mt-1 ml-1">{msg}</p> : null;

// ── Field border helper ───────────────────────────────────────────
const fieldClass = (error) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad transition-colors ${
        error ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-quad"
    }`;

// ── Password strength indicator ───────────────────────────────────
function PasswordStrength({ password }) {
    if (!password) return null;
    const checks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
    const textColors = ["text-red-500", "text-yellow-500", "text-blue-500", "text-green-600"];
    const idx = passed === 0 ? 0 : passed - 1;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passed ? colors[idx] : "bg-gray-200"
                        }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${textColors[idx]}`}>
                {labels[idx]} password
                {!checks.length && " · min 8 chars"}
                {checks.length && !checks.upper && " · add uppercase"}
                {checks.length && checks.upper && !checks.lower && " · add lowercase"}
                {checks.length && checks.upper && checks.lower && !checks.number && " · add a number"}
            </p>
        </div>
    );
}

// ── Validation helpers ────────────────────────────────────────────
const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
const isStrongEnough = (val) => val.length >= 8;

function Form(props) {
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setpassword2] = useState("");
    const [company_name, setCompany_name] = useState("");
    const [loading, setLoading] = useState(false);
    const [profile_image, setProfile_image] = useState(null);
    const [hotelList, setHotelList] = useState([]);
    const [hotel, setHotel] = useState(-1);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    // ── Field-level error state ───────────────────────────────────
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // ── Mark a field as touched on blur ──────────────────────────
    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field);
    };

    // ── Real-time single-field validation ─────────────────────────
    const validateField = (field) => {
        const newErrors = { ...errors };

        if (field === "first_name") {
            if (!first_name.trim()) newErrors.first_name = "First name is required.";
            else if (first_name.trim().length < 2) newErrors.first_name = "Must be at least 2 characters.";
            else if (!/^[a-zA-Z\s'-]+$/.test(first_name)) newErrors.first_name = "Only letters are allowed.";
            else delete newErrors.first_name;
        }
        if (field === "last_name") {
            if (!last_name.trim()) newErrors.last_name = "Last name is required.";
            else if (last_name.trim().length < 2) newErrors.last_name = "Must be at least 2 characters.";
            else if (!/^[a-zA-Z\s'-]+$/.test(last_name)) newErrors.last_name = "Only letters are allowed.";
            else delete newErrors.last_name;
        }
        if (field === "company_name") {
            if (!company_name.trim()) newErrors.company_name = "Company name is required.";
            else if (company_name.trim().length < 2) newErrors.company_name = "Must be at least 2 characters.";
            else delete newErrors.company_name;
        }
        if (field === "hotel") {
            if (hotel === -1) newErrors.hotel = "Please select a hotel.";
            else delete newErrors.hotel;
        }
        if (field === "email") {
            if (!email.trim()) newErrors.email = "Email address is required.";
            else if (!isValidEmail(email)) newErrors.email = "Enter a valid email address.";
            else delete newErrors.email;
        }
        if (field === "password") {
            if (!password) newErrors.password = "Password is required.";
            else if (!isStrongEnough(password)) newErrors.password = "Password must be at least 8 characters.";
            else delete newErrors.password;
            // Re-validate confirm password if it's been touched
            if (touched.password2 && password2) {
                if (password !== password2) newErrors.password2 = "Passwords do not match.";
                else delete newErrors.password2;
            }
        }
        if (field === "password2") {
            if (!password2) newErrors.password2 = "Please confirm your password.";
            else if (password !== password2) newErrors.password2 = "Passwords do not match.";
            else delete newErrors.password2;
        }

        setErrors(newErrors);
        return newErrors;
    };

    // ── Full form validation before submit ───────────────────────
    const validateAll = () => {
        const newErrors = {};

        if (props.method === "login") {
            if (!email.trim()) newErrors.email = "Email address is required.";
            else if (!isValidEmail(email)) newErrors.email = "Enter a valid email address.";
            if (!password) newErrors.password = "Password is required.";
        } else {
            // Register — common fields
            if (!first_name.trim()) newErrors.first_name = "First name is required.";
            else if (first_name.trim().length < 2) newErrors.first_name = "Must be at least 2 characters.";
            else if (!/^[a-zA-Z\s'-]+$/.test(first_name)) newErrors.first_name = "Only letters are allowed.";

            if (!last_name.trim()) newErrors.last_name = "Last name is required.";
            else if (last_name.trim().length < 2) newErrors.last_name = "Must be at least 2 characters.";
            else if (!/^[a-zA-Z\s'-]+$/.test(last_name)) newErrors.last_name = "Only letters are allowed.";

            if (!email.trim()) newErrors.email = "Email address is required.";
            else if (!isValidEmail(email)) newErrors.email = "Enter a valid email address.";

            if (!password) newErrors.password = "Password is required.";
            else if (!isStrongEnough(password)) newErrors.password = "Password must be at least 8 characters.";

            if (!password2) newErrors.password2 = "Please confirm your password.";
            else if (password !== password2) newErrors.password2 = "Passwords do not match.";

            // Owner-specific
            if (props.userType === "Owner") {
                if (!company_name.trim()) newErrors.company_name = "Company name is required.";
                else if (company_name.trim().length < 2) newErrors.company_name = "Must be at least 2 characters.";
            }

            // Manager-specific
            if (props.userType === "Manager") {
                if (hotel === -1) newErrors.hotel = "Please select a hotel.";
            }
        }

        setErrors(newErrors);
        // Mark all fields as touched so errors show
        const allTouched = {};
        Object.keys(newErrors).forEach((k) => (allTouched[k] = true));
        setTouched((prev) => ({ ...prev, ...allTouched }));
        return newErrors;
    };

    const loadHotels = async () => {
        await api
            .get("/api/gethotels/")
            .then((res) => {
                setHotelList(res.data);
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        const validationErrors = validateAll();
        if (Object.keys(validationErrors).length > 0) return; // Stop if invalid

        setLoading(true);
        if (props.method === "login") {
            await api
                .post("/api/token/", { email, password })
                .then((res) => {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                    props.changeLogIn(true);
                    props.loadRole();
                    setLoading(false);
                    navigate("/dashboard");
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data?.detail || "Login failed. Please try again.");
                });
            setLoading(false);
        } else {
            const formData = new FormData();
            var data = {
                user: {
                    first_name,
                    last_name,
                    email,
                    password,
                    password2,
                },
            };
            if (props.userType === "Owner") {
                data = { ...data, company_name };
            } else {
                data = { ...data, hotel };
            }

            formData.append("data", JSON.stringify(data));
            const apiUrl =
                props.userType === "Owner"
                    ? "/api/user/owner/register/"
                    : "/api/user/manager/register/";
            await api
                .post(apiUrl, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((res) => {
                    if (props.userType === "Owner") {
                        alert("Account created! A welcome email has been sent to your inbox.");
                        navigate("/login");
                    } else {
                        props.handleManagerRegister();
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data?.detail || "Registration failed.");
                    if (
                        props.userType === "Manager" &&
                        hotelList &&
                        hotelList.length === 0
                    ) {
                        setErrorMessage("Please create a hotel first.");
                    }
                });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (props.userType === "Manager" && props.method !== "login") {
            loadHotels();
        }
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <h2 className="text-3xl font-bold mb-6 text-center">
                {props.method === "login" ? "Log in to Account" : "Create an Account"}
            </h2>

            {/* Global server error */}
            {errorMessage && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-600 rounded-lg px-4 py-2 mb-4 text-sm">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} method="POST" className="flex flex-col gap-4" noValidate>

                {/* ── First & Last Name ───────────────────────────── */}
                {props.method !== "login" && (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1" htmlFor="firstName">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                className={fieldClass(touched.first_name && errors.first_name)}
                                value={first_name}
                                onChange={(e) => {
                                    setFirst_name(e.target.value);
                                    if (touched.first_name) validateField("first_name");
                                }}
                                onBlur={() => handleBlur("first_name")}
                                placeholder="John"
                            />
                            <FieldError msg={touched.first_name && errors.first_name} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1" htmlFor="lastName">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                className={fieldClass(touched.last_name && errors.last_name)}
                                value={last_name}
                                onChange={(e) => {
                                    setLast_name(e.target.value);
                                    if (touched.last_name) validateField("last_name");
                                }}
                                onBlur={() => handleBlur("last_name")}
                                placeholder="Doe"
                            />
                            <FieldError msg={touched.last_name && errors.last_name} />
                        </div>
                    </div>
                )}

                {/* ── Company Name (Owner) ─────────────────────────── */}
                {props.method !== "login" && props.userType === "Owner" && (
                    <div>
                        <label className="block text-gray-700 font-medium mb-1" htmlFor="company">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="company"
                            type="text"
                            className={fieldClass(touched.company_name && errors.company_name)}
                            value={company_name}
                            onChange={(e) => {
                                setCompany_name(e.target.value);
                                if (touched.company_name) validateField("company_name");
                            }}
                            onBlur={() => handleBlur("company_name")}
                            placeholder="Acme Hotels Pvt Ltd"
                        />
                        <FieldError msg={touched.company_name && errors.company_name} />
                    </div>
                )}

                {/* ── Hotel Dropdown (Manager) ─────────────────────── */}
                {props.method !== "login" && props.userType === "Manager" && (
                    <div>
                        <label className="block text-gray-700 font-medium mb-1" htmlFor="hotel">
                            Hotel <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="hotel"
                            id="hotel"
                            className={fieldClass(touched.hotel && errors.hotel)}
                            onChange={(e) => {
                                setHotel(parseInt(e.target.value, 10));
                                setTouched((prev) => ({ ...prev, hotel: true }));
                                if (e.target.value !== "-1") {
                                    setErrors((prev) => { const n = { ...prev }; delete n.hotel; return n; });
                                }
                            }}
                            onBlur={() => handleBlur("hotel")}
                            defaultValue="-1"
                        >
                            <option value="-1" disabled>Select Hotel</option>
                            {hotelList.map((value) => (
                                <option key={value.id} value={value.id}>
                                    {value.name}
                                </option>
                            ))}
                        </select>
                        <FieldError msg={touched.hotel && errors.hotel} />
                        {hotelList.length === 0 && (
                            <p className="text-amber-600 text-xs mt-1">⚠️ No hotels found. Please create a hotel first.</p>
                        )}
                    </div>
                )}

                {/* ── Email ───────────────────────────────────────── */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={fieldClass(touched.email && errors.email)}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (touched.email) validateField("email");
                        }}
                        onBlur={() => handleBlur("email")}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                    <FieldError msg={touched.email && errors.email} />
                </div>

                {/* ── Password ────────────────────────────────────── */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        className={fieldClass(touched.password && errors.password)}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (touched.password) validateField("password");
                        }}
                        onBlur={() => handleBlur("password")}
                        placeholder={props.method === "login" ? "Your password" : "Min. 8 characters"}
                        autoComplete={props.method === "login" ? "current-password" : "new-password"}
                    />
                    <FieldError msg={touched.password && errors.password} />
                    {/* Password strength bar — only for register */}
                    {props.method !== "login" && <PasswordStrength password={password} />}
                </div>

                {/* ── Confirm Password ────────────────────────────── */}
                {props.method !== "login" && (
                    <div>
                        <label className="block text-gray-700 font-medium mb-1" htmlFor="password2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password2"
                            type="password"
                            className={fieldClass(touched.password2 && errors.password2)}
                            value={password2}
                            onChange={(e) => {
                                setpassword2(e.target.value);
                                if (touched.password2) validateField("password2");
                            }}
                            onBlur={() => handleBlur("password2")}
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                        />
                        <FieldError msg={touched.password2 && errors.password2} />
                        {/* Match indicator */}
                        {password2 && password && (
                            <p className={`text-xs mt-1 font-medium ${password === password2 ? "text-green-600" : "text-red-500"}`}>
                                {password === password2 ? "✓ Passwords match" : "✗ Passwords do not match"}
                            </p>
                        )}
                    </div>
                )}

                {/* ── Submit ──────────────────────────────────────── */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-ternary text-white py-2 px-4 rounded-lg shadow-md font-semibold text-lg hover:bg-quad disabled:opacity-60 transition-all duration-200 mt-1"
                >
                    {loading
                        ? props.method === "login"
                            ? "Logging in..."
                            : "Creating account..."
                        : props.method === "login"
                        ? "Log in"
                        : "Register"}
                </button>
            </form>
        </>
    );
}

export default Form;
