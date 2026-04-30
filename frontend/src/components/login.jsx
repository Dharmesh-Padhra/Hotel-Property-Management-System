import React, { useState } from "react";
import Form from "./form";
import axios from "axios";

function Login(props) {
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState("");
    const [forgotError, setForgotError] = useState("");

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage("");
        setForgotError("");
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/user/forgot-password/`,
                { email: forgotEmail }
            );
            setForgotMessage(res.data.detail);
        } catch (err) {
            setForgotError(
                err.response?.data?.detail || "Something went wrong. Please try again."
            );
        } finally {
            setForgotLoading(false);
        }
    };

    const closeForgotModal = () => {
        setShowForgotModal(false);
        setForgotEmail("");
        setForgotMessage("");
        setForgotError("");
    };

    return (
        <div className="flex justify-center items-center h-[100%] bg-gray-100 bg-gradient-to-r from-teal-400 to-yellow-200">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <Form method="login" loadRole={() => props.loadRole()} changeLogIn={props.changeLogIn} />

                {/* Forgot Password Link */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowForgotModal(true)}
                        className="text-sm text-teal-600 hover:text-teal-800 hover:underline transition-colors duration-200 font-medium"
                        id="forgotPasswordBtn"
                    >
                        Forgot Password?
                    </button>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-fadeIn">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white text-xl font-bold">Reset Password</h2>
                            <button
                                onClick={closeForgotModal}
                                id="closeForgotModal"
                                className="text-white hover:text-teal-100 transition-colors text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5">
                            {!forgotMessage ? (
                                <>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Enter your registered email address and we'll send you a new temporary password.
                                    </p>
                                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                                        <div>
                                            <label
                                                htmlFor="forgotEmail"
                                                className="block text-gray-700 font-medium mb-1 text-sm"
                                            >
                                                Email Address
                                            </label>
                                            <input
                                                id="forgotEmail"
                                                type="email"
                                                required
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                            />
                                        </div>

                                        {forgotError && (
                                            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                {forgotError}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            id="forgotPasswordSubmit"
                                            disabled={forgotLoading}
                                            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200"
                                        >
                                            {forgotLoading ? "Sending..." : "Send New Password"}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                /* Success State */
                                <div className="text-center py-4">
                                    <div className="text-5xl mb-4">✅</div>
                                    <p className="text-gray-700 font-medium mb-2">{forgotMessage}</p>
                                    <p className="text-gray-500 text-sm">Check your inbox and use the new password to log in.</p>
                                    <button
                                        onClick={closeForgotModal}
                                        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-lg font-semibold text-sm transition-colors duration-200"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;