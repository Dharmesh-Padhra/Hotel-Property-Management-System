import React, { useEffect, useState } from "react";
import api from "../../api";

function ProfileView(props) {
    const [loading, setLoading] = useState(false);
    const [first_name, setFirstname] = useState("");
    const [last_name, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [company_name, setCompany_name] = useState("");
    const [profile_image, setProfileImage] = useState(null);
    const [profileUrl, setProfileUrl] = useState(null);
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");
    const [formErrors, setFormErrors] = useState({});

    // Change password state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cpLoading, setCpLoading] = useState(false);
    const [cpMessage, setCpMessage] = useState("");
    const [cpError, setCpError] = useState("");

    const getUserType = async () => {
        try {
            const res1 = await api.get("/api/usertype/");
            setRole(res1.data.role);
            return res1.data.role;
        } catch (error) {
            console.log(error);
        }
    };
    const loadData = async (userRole) => {
        setLoading(true);
        try {
            var res;
            if (userRole === "Owner") {
                res = await api.get("/api/user/owner/");
            } else if (userRole === "Manager") {
                res = await api.get("/api/user/manager/");
            }
            if (res && res.data) {
                console.log(res.data);
                setFirstname(res.data.user.first_name);
                setLastname(res.data.user.last_name);
                setPhoneNumber(res.data.user.phone_number);
                setEmail(res.data.user.email);
                setProfileUrl(api.getUri() + res.data.user.profile_image);
                if (userRole === "Owner") {
                    setCompany_name(res.data.company_name);
                }
            } else {
                // alert('no data')
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(file);

            setProfileUrl(URL.createObjectURL(file));
        }
    };

    const inputClasses =
        "rounded-full bg-quad focus:outline-secondary h-10 w-64 pl-4";

    const validate = () => {
        const errors = {};
        if (!first_name.trim()) {
            errors.first_name = "First Name is required.";
        }
        if (!last_name.trim()) {
            errors.last_name = "Last Name is required.";
        }
        // phone_number is already digits-only (stripped on input)
        if (phone_number && phone_number.length !== 10) {
            errors.phone_number = "Phone Number must be exactly 10 digits.";
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setLoading(true);
        const ManagerJson = {
            user: {
                first_name,
                last_name,
                phone_number,
            },
        };
        const OwnerJson = { ...ManagerJson, company_name };
        const formData = new FormData();
        if (role === "Owner") {
            formData.append("data", JSON.stringify(OwnerJson));
        } else {
            formData.append("data", JSON.stringify(ManagerJson));
        }
        formData.append("profile_image", profile_image);

        await api
            .post("/api/user/updateprofile/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                setMessage(res.data.detail);
                setLoading(false);
                alert("Profile Updated.");
            })
            .catch((err) => alert(err.response.data.detail));
        setLoading(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setCpMessage("");
        setCpError("");

        if (newPassword !== confirmPassword) {
            setCpError("New password and confirm password do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setCpError("New password must be at least 8 characters long.");
            return;
        }

        setCpLoading(true);
        try {
            const res = await api.post("/api/user/change-password/", {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setCpMessage(res.data.detail);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setCpError(
                err.response?.data?.detail || "Something went wrong. Please try again."
            );
        } finally {
            setCpLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const userRole = await getUserType();
            if (userRole) {
                loadData(userRole);
                setRole(userRole);
            }
        };
        init();
        // eslint-disable-next-line
    }, []);
    return (
        <>
            <h1 className="text-5xl mb-5">My Profile</h1>
            <form
                className="text-xl shadow-[rgb(38,57,77)_0px_20px_30px_-10px] border-primary b rounded-lg p-5 mr-40"
                onSubmit={handleSubmit}
            >
                <div className="grid grid-cols-3 gap-4">
                    <div className="row-span-5">
                        <div className="mx-auto relative w-64 h-64 rounded-full overflow-hidden">
                            <img
                                src={
                                    profileUrl !== api.getUri() + "null"
                                        ? profileUrl
                                        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                }
                                alt="profilePreview"
                                className="object-cover object-center w-full h-full"
                            />
                            <label
                                htmlFor="profileUpload"
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            >
                                <span className="text-white text-sm font-medium">
                                    Change Profile
                                </span>
                            </label>
                            <input
                                type="file"
                                id="profileUpload"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    <div className="col-span-2">
                        {role === "Owner" && (
                            <>
                                <label htmlFor="companyName">
                                    Company Name{" "}
                                </label>
                                <br />
                                <input
                                    type="text"
                                    name="companyName"
                                    id="companyName"
                                    value={company_name}
                                    onChange={(e) =>
                                        setCompany_name(e.target.value)
                                    }
                                    className={inputClasses}
                                />
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-subgrid col-start-2 col-span-2 gap-4">
                        <div className="">
                            <label htmlFor="fname">
                                First Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <br />
                            <input
                                type="text"
                                name="fname"
                                id="fname"
                                value={first_name}
                                onChange={(e) => {
                                    setFirstname(e.target.value);
                                    if (formErrors.first_name)
                                        setFormErrors((prev) => ({ ...prev, first_name: "" }));
                                }}
                                className={`${inputClasses} ${formErrors.first_name ? "border border-red-500" : ""}`}
                            />
                            {formErrors.first_name && (
                                <p className="text-red-500 text-sm mt-1 pl-4">
                                    {formErrors.first_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="lname">
                                Last Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <br />
                            <input
                                type="text"
                                name="lname"
                                id="lname"
                                value={last_name}
                                onChange={(e) => {
                                    setLastname(e.target.value);
                                    if (formErrors.last_name)
                                        setFormErrors((prev) => ({ ...prev, last_name: "" }));
                                }}
                                className={`${inputClasses} ${formErrors.last_name ? "border border-red-500" : ""}`}
                            />
                            {formErrors.last_name && (
                                <p className="text-red-500 text-sm mt-1 pl-4">
                                    {formErrors.last_name}
                                </p>
                            )}
                        </div>

                        <div className="">
                            <label htmlFor="email">Email </label>
                            <br />
                            <input
                                type="text"
                                disabled
                                name="email"
                                id="email"
                                className={inputClasses + " text-gray-500"}
                                value={email}
                            />
                        </div>
                        <div className="">
                            <label htmlFor="phNo">Phone Number </label>
                            <br />
                            <input
                                type="text"
                                name="phNo"
                                id="phNo"
                                value={phone_number}
                                maxLength={10}
                                inputMode="numeric"
                                placeholder="10-digit number"
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value.replace(/\D/g, ""));
                                    if (formErrors.phone_number)
                                        setFormErrors((prev) => ({ ...prev, phone_number: "" }));
                                }}
                                className={`${inputClasses} ${formErrors.phone_number ? "border border-red-500" : ""}`}
                            />
                            {formErrors.phone_number && (
                                <p className="text-red-500 text-sm mt-1 pl-4">
                                    {formErrors.phone_number}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-ternary text-white py-2 px-4 rounded-lg shadow-md font-semibold text-lg hover:bg-quad"
                >
                    Save Changes
                </button>
            </form>

            {/* ── Change Password Section ── */}
            <div className="mt-8 mr-40 shadow-[rgb(38,57,77)_0px_20px_30px_-10px] rounded-lg overflow-hidden">
                {/* Collapsible Header */}
                <button
                    id="toggleChangePassword"
                    type="button"
                    onClick={() => {
                        setShowChangePassword((prev) => !prev);
                        setCpMessage("");
                        setCpError("");
                    }}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-4 text-white text-xl font-semibold hover:from-teal-600 hover:to-teal-500 transition-all duration-200"
                >
                    <span>🔒 Change Password</span>
                    <span className="text-2xl leading-none select-none">
                        {showChangePassword ? "−" : "+"}
                    </span>
                </button>

                {showChangePassword && (
                    <div className="bg-white px-8 py-6 border border-t-0 border-gray-200 rounded-b-lg">
                        {cpMessage ? (
                            /* Success State */
                            <div className="flex flex-col items-center py-4 gap-3">
                                <div className="text-4xl">✅</div>
                                <p className="text-green-700 font-medium text-lg">{cpMessage}</p>
                                <button
                                    onClick={() => {
                                        setCpMessage("");
                                        setShowChangePassword(false);
                                    }}
                                    className="mt-2 bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-lg font-semibold text-base transition-colors duration-200"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleChangePassword}
                                className="grid grid-cols-2 gap-x-8 gap-y-5 text-base"
                            >
                                {/* Current Password */}
                                <div className="col-span-2 md:col-span-1">
                                    <label
                                        htmlFor="currentPassword"
                                        className="block font-medium text-gray-700 mb-1"
                                    >
                                        Current Password
                                    </label>
                                    <input
                                        id="currentPassword"
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="rounded-full bg-quad focus:outline-secondary h-10 w-full pl-4 pr-4"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {/* Spacer on wide layout */}
                                <div className="hidden md:block" />

                                {/* New Password */}
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block font-medium text-gray-700 mb-1"
                                    >
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="rounded-full bg-quad focus:outline-secondary h-10 w-full pl-4 pr-4"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label
                                        htmlFor="confirmNewPassword"
                                        className="block font-medium text-gray-700 mb-1"
                                    >
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="confirmNewPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="rounded-full bg-quad focus:outline-secondary h-10 w-full pl-4 pr-4"
                                        placeholder="Repeat new password"
                                    />
                                </div>

                                {/* Error Message */}
                                {cpError && (
                                    <div className="col-span-2">
                                        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                            {cpError}
                                        </p>
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="col-span-2">
                                    <button
                                        type="submit"
                                        id="changePasswordSubmit"
                                        disabled={cpLoading}
                                        className="bg-ternary hover:bg-quad disabled:opacity-60 text-white py-2 px-6 rounded-lg shadow-md font-semibold text-base transition-colors duration-200"
                                    >
                                        {cpLoading ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
export default ProfileView;
