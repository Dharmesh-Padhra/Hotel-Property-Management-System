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

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                            <label htmlFor="fname">First Name </label>
                            <br />
                            <input
                                type="text"
                                name="fname"
                                id="fname"
                                value={first_name}
                                onChange={(e) => setFirstname(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label htmlFor="lname">Last Name </label>
                            <br />
                            <input
                                type="text"
                                name="lname"
                                id="lname"
                                value={last_name}
                                onChange={(e) => setLastname(e.target.value)}
                                className={inputClasses}
                            />
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
                                onChange={(e) =>
                                    setPhoneNumber(
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                className={inputClasses}
                            />
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
        </>
    );
}
export default ProfileView;
