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
    const [customerDetails, setCustomerDetails] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        address: "",
        email: "",
        id_proof: "",
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
        setCustomerDetails({
            ...customerDetails,
            [name]: value,
        });
    };
    const resetForm = () => {
        if (reset) {
            setCustomerDetails({
                first_name: "",
                last_name: "",
                phone_number: "",
                address: "",
                email: "",
                id_proof: "",
            });
            setBookingDetails({
                check_in: "",
                check_out: "",
            });
        }
        setSelectedFloor("");
        setSelectedRoom("");
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
                            First Name:
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={customerDetails.first_name}
                            onChange={handleCustomerChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">
                            Last Name:
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={customerDetails.last_name || ""}
                            onChange={handleCustomerChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                </div>

                {/* Contact Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium">
                            Phone Number:
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={customerDetails.phone_number || ""}
                            onChange={handleCustomerChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={customerDetails.email || ""}
                            onChange={handleCustomerChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                </div>

                {/* Address Section */}
                <div>
                    <label className="block mb-2 font-medium">Address:</label>

                    <textarea
                        name="address"
                        value={customerDetails.address || ""}
                        onChange={handleCustomerChange}
                        className="border p-2 rounded w-full h-24 resize-none"
                        required
                    />
                </div>

                {/* ID Proof Section */}
                <div>
                    <label className="block mb-2 font-medium">ID Proof:</label>
                    <input
                        type="text"
                        name="id_proof"
                        value={customerDetails.id_proof || ""}
                        onChange={handleCustomerChange}
                        className="border p-2 rounded w-full"
                        required
                    />
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
