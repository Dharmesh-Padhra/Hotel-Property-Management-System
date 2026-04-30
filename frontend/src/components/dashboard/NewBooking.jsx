import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../../api";
function NewBooking() {
    // State to hold form data
    const [today] = useState(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero
        const day = String(date.getDate()).padStart(2, "0"); // Add leading zero
        return `${year}-${month}-${day}`;
    });
    const location = useLocation();
    const [hotelList, setHotelList] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [reset, setReset] = useState(true);
    const [document, setDocument] = useState(null);
    const [documentUrl, setDocumentUrl] = useState("");
    const [previousBooking, setPreviousBooking] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [customerDetails, setCustomerDetails] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        address: "",
        email: "",
        aadhar_number: "",
    });
    const [bookingDetails, setBookingDetails] = useState({
        check_in: "",
        check_out: "",
    });

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingDetails({
            ...bookingDetails,
            [name]: value,
        });
    };
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        // Strip non-digit characters for numeric-only fields
        if (name === "phone_number" || name === "aadhar_number") {
            const digitsOnly = value.replace(/\D/g, "");
            setCustomerDetails({ ...customerDetails, [name]: digitsOnly });
        } else {
            setCustomerDetails({ ...customerDetails, [name]: value });
        }
    };
    const resetForm = () => {
        if (reset) {
            setCustomerDetails({
                first_name: "",
                last_name: "",
                phone_number: "",
                address: "",
                email: "",
                aadhar_number: "",
            });
            setBookingDetails({
                check_in: "",
                check_out: "",
            });
        }
        setSelectedFloor("");
        setSelectedRoom("");
        setFormErrors({});
    };

    const validate = () => {
        const errors = {};
        if (!customerDetails.first_name.trim()) {
            errors.first_name = "First Name is required.";
        }
        if (!customerDetails.last_name.trim()) {
            errors.last_name = "Last Name is required.";
        }
        // phone_number is already digits-only (stripped on input)
        const phone = customerDetails.phone_number;
        if (!phone) {
            errors.phone_number = "Phone Number is required.";
        } else if (phone.length !== 10) {
            errors.phone_number = "Phone Number must be exactly 10 digits.";
        }
        if (customerDetails.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerDetails.email.trim())) {
                errors.email = "Please enter a valid email address.";
            }
        }
        if (!customerDetails.address.trim()) {
            errors.address = "Address is required.";
        }
        // aadhar_number is already digits-only (stripped on input)
        const aadhar = customerDetails.aadhar_number;
        if (aadhar && (aadhar.length < 12 || aadhar.length > 16)) {
            errors.aadhar_number =
                "Aadhar / VID number must be between 12 and 16 digits.";
        }
        return errors;
    };

    const loadHotels = async () => {
        await api
            .get("/api/gethotels/")
            .then((r) => {
                setHotelList(r.data);
            })
            .catch((e) => {
                alert(e.response.data.detail);
            });
    };
    const loadRooms = async () => {
        await api.get("/api/hotel/rooms/").then((res) => setRoomList(res.data));
    };
    const loadBooking = async () => {
        await api
            .get("/api/getbookings/")
            .then((res) => {
                setBookingList(res.data);
            })
            .catch((err) => alert(err.response.data.detail));
    };

    const filteredRooms = roomList.filter((room) => {
        if (room.hotel !== selectedHotel) return false;
        const isRoomBooked = bookingList.some((booking) => {
            return (
                booking.room === room.id &&
                (bookingDetails.check_in > booking.check_out ||
                    bookingDetails.check_out < booking.check_in) === false
            );
        });
        return !isRoomBooked;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate before submitting
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        // Here you can handle the form submission logic
        localStorage.setItem(
            "previousBooking",
            JSON.stringify(customerDetails)
        );
        const formData = new FormData();
        const data = {
            customerDetails,
            bookingDetails,
            hotel: selectedHotel,
            room: selectedRoom,
            floor: selectedFloor,
        };
        formData.append("data", JSON.stringify(data));
        if (document) {
            formData.append("document", document);
        }
        resetForm();

        await api
            .post("/api/addbooking/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                alert("Booking successful.");
                loadBooking();
                loadRooms()
            })
            .catch((err) => alert(err.response.data.detail));
        // console.log("Booking Details:", bookingDetails);
    };

    useEffect(() => {
        const init = () => {
            const previousBooking = localStorage.getItem("previousBooking");
            if (previousBooking) {
                setPreviousBooking(JSON.parse(previousBooking));
            }
            const states = location.state || {};
            if (states.selectedHotel) {
                setSelectedHotel(states.selectedHotel);
            }
            if (states.roomFloor) {
                setSelectedFloor(states.roomFloor);
            }
            if (states.roomId) {
                setSelectedRoom(states.roomId);
            }
            if (states.bookingDetails) {
                setBookingDetails(states.bookingDetails);
            }

            loadHotels();
            loadBooking();
            loadRooms();
        };
        init();
    }, [location.state]);
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-5xl font-bold">New Booking</h1>
                <NavLink
                    to="/dashboard/booking/"
                    className="bg-secondary mx-5 text-white px-6 py-2 rounded shadow-md hover:bg-primary transition duration-300"
                >
                    Back
                </NavLink>
            </div>
            <form
                onSubmit={handleSubmit}
                className="max-w-full mx-auto space-y-8 py-6 px-10 bg-white rounded-lg shadow-md"
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl">
                        Hotel: {"  "}
                        {hotelList
                            .filter((hotel) => hotel.id === selectedHotel)
                            .map((hotel) => hotel.name)}
                    </h1>
                    <button
                        type="button"
                        onClick={() => setCustomerDetails(previousBooking)}
                        className="bg-secondary mx-5 text-white px-6 py-2 rounded shadow-md hover:bg-primary transition duration-300"
                    >
                        Load Previous details
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium">
                            Arrival Date:
                        </label>
                        <input
                            type="date"
                            min={today}
                            name="check_in"
                            value={bookingDetails.check_in}
                            onChange={handleBookingChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">
                            Checkout Date:
                        </label>
                        <input
                            type="date"
                            min={bookingDetails.check_in}
                            disabled={!bookingDetails.check_in}
                            name="check_out"
                            value={bookingDetails.check_out}
                            onChange={handleBookingChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                </div>

                <div>
                    <h1 className=" text-2xl">Room Details</h1>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="floor"
                            className="block mb-2 font-medium"
                        >
                            Floor:
                        </label>
                        <select
                            name="floor"
                            id="floor"
                            className="border p-2 rounded w-full"
                            value={selectedFloor}
                            required
                            onChange={(e) => setSelectedFloor(e.target.value)}
                        >
                            <option value="" selected hidden>
                                Select Floor
                            </option>
                            {[
                                ...new Set(
                                    filteredRooms.map((room) => room.floor)
                                ),
                            ].map((floor, index) => (
                                <option value={floor}>{floor}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="room"
                            className="block mb-2 font-medium"
                        >
                            Room:
                        </label>
                        <select
                            disabled={!selectedFloor}
                            name="room"
                            required
                            value={selectedRoom}
                            className="border p-2 rounded w-full"
                            id="room"
                            onChange={(e) => setSelectedRoom(e.target.value)}
                        >
                            <option value="" selected hidden>
                                Select Room
                            </option>
                            {filteredRooms
                                .filter((room) => room.floor === selectedFloor)
                                .map((room) => (
                                    <option value={room.id}>{room.name}</option>
                                ))}
                        </select>
                    </div>
                </div>
                <div className="">
                    <h1 className=" text-2xl">Guest Details</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium">
                            First Name:<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={customerDetails.first_name}
                            onChange={handleCustomerChange}
                            className={`border p-2 rounded w-full ${formErrors.first_name ? "border-red-500" : ""}`}
                        />
                        {formErrors.first_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.first_name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">
                            Last Name:<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={customerDetails.last_name || ""}
                            onChange={handleCustomerChange}
                            className={`border p-2 rounded w-full ${formErrors.last_name ? "border-red-500" : ""}`}
                        />
                        {formErrors.last_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.last_name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium">
                            Phone Number:<span className="text-red-500">*</span> (10 digits)
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={customerDetails.phone_number || ""}
                            onChange={handleCustomerChange}
                            maxLength={10}
                            inputMode="numeric"
                            placeholder="Enter 10-digit mobile number"
                            className={`border p-2 rounded w-full ${formErrors.phone_number ? "border-red-500" : ""}`}
                        />
                        {formErrors.phone_number && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.phone_number}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Email:</label>
                        <input
                            type="text"
                            name="email"
                            value={customerDetails.email || ""}
                            onChange={handleCustomerChange}
                            placeholder="example@email.com"
                            className={`border p-2 rounded w-full ${formErrors.email ? "border-red-500" : ""}`}
                        />
                        {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* Address Section */}
                <div>
                    <label className="block mb-2 font-medium">
                        Address:<span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="address"
                        value={customerDetails.address || ""}
                        onChange={handleCustomerChange}
                        className={`border p-2 rounded w-full h-24 resize-none ${formErrors.address ? "border-red-500" : ""}`}
                    />
                    {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">
                            {formErrors.address}
                        </p>
                    )}
                </div>

                {/* Aadhar Number Section */}
                <div>
                    <label className="block mb-2 font-medium">
                        Aadhar / VID Number: (12–16 digits)
                    </label>
                    <input
                        type="text"
                        name="aadhar_number"
                        value={customerDetails.aadhar_number || ""}
                        onChange={handleCustomerChange}
                        maxLength={16}
                        placeholder="Enter 12-digit Aadhar or 16-digit VID"
                        className={`border p-2 rounded w-full ${formErrors.aadhar_number ? "border-red-500" : ""
                            }`}
                    />
                    {formErrors.aadhar_number && (
                        <p className="text-red-500 text-sm mt-1">
                            {formErrors.aadhar_number}
                        </p>
                    )}
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        onClick={() => setReset(true)}
                        className="bg-secondary mx-5 text-white px-6 py-2 rounded shadow-md hover:bg-primary transition duration-300"
                    >
                        Book and Reset
                    </button>
                    <button
                        type="submit"
                        onClick={() => setReset(false)}
                        className="bg-secondary mx-5 text-white px-6 py-2 rounded shadow-md hover:bg-primary transition duration-300"
                    >
                        Book and Add Room
                    </button>
                    <button
                        type="reset"
                        onClick={() => {
                            setReset(true);
                            resetForm();
                        }}
                        className="bg-secondary mx-5 text-white px-6 py-2 rounded shadow-md hover:bg-primary transition duration-300"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </>
    );
}

export default NewBooking;
