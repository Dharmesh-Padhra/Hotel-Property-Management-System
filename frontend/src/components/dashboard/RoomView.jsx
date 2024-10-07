import React, { useEffect, useState } from "react";
import api from "../../api";
import { FaEdit } from "react-icons/fa"; // Import edit icon from react-icons
import { NavLink } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";

function RoomView(props) {
    const [userType, setUserType] = useState("");
    const [selectedHotel, setSelectedHotel] = useState(-1);
    const [hotelList, setHotelList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [editRoomId, setEditRoomId] = useState(false);
    const [roomList, setRoomList] = useState([]);
    const [editRoomDetails, setEditRoomDetails] = useState({ beds: "" });
    const [filter, setFilter] = useState("all"); // For filtering rooms
    const [bookingDetails, setBookingDetails] = useState({
        check_in: "",
        check_out: "",
    });
    const [today] = useState(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero
        const day = String(date.getDate()).padStart(2, "0"); // Add leading zero
        return `${year}-${month}-${day}`;
    });
    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingDetails({
            ...bookingDetails,
            [name]: value,
        });
    };
    const resetDates = () => {
        setBookingDetails({
            check_in: "",
            check_out: "",
        });
    };
    const loadUserType = async () => {
        await api
            .get("/api/usertype/")
            .then((res) => setUserType(res.data.role))
            .catch((res) => alert(res.response.data.detail));
    };
    const loadBooking = async () => {
        await api
            .get("/api/getbookings/")
            .then((res) => {
                setBookingList(res.data);
            })
            .catch((err) => alert(err.response.data.detail));
    };
    const loadRooms = async () => {
        await api.get("/api/hotel/rooms/").then((res) => setRoomList(res.data));
    };

    const handleHotelChange = (e) => {
        setSelectedHotel(parseInt(e.target.value, 10));
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value); // Update the filter state when a new option is selected
    };
    const handleEditChange = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
        const { name, value } = e.target;
        setEditRoomDetails((prev) => ({
            ...prev,
            [name]: parseInt(value),
        }));
    };
    const handleEditSubmit = async () => {
        const data = {
            hotel: selectedHotel,
            room: editRoomId,
            ...editRoomDetails,
        };
        await api
            .post("/api/hotel/room/edit/", data)
            .then((res) => {
                setEditRoomId(null);
                setEditRoomDetails({});
                alert(res.data.detail);
                loadRooms();
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };

    const loadHotels = async () => {
        await api
            .get("/api/gethotels/")
            .then((r) => {
                setHotelList(r.data);
                if (r.data.length > 0) setSelectedHotel(r.data[0].id);
            })
            .catch((e) => {
                alert(e.response.data.detail);
            });
    };

    const groupRoomsByFloor = (rooms) => {
        const groupedRooms = {};
        rooms.forEach((room) => {
            if (!groupedRooms[room.floor]) {
                groupedRooms[room.floor] = [];
            }
            groupedRooms[room.floor].push(room);
        });
        return groupedRooms;
    };

    // Sort floors to ensure "Ground Floor" appears first and others in numerical order
    const sortFloors = (floorA, floorB) => {
        if (floorA === "Ground Floor") return -1;
        if (floorB === "Ground Floor") return 1;
        return parseInt(floorA, 10) - parseInt(floorB, 10);
    };
    const filteredRooms = roomList.filter((room) => {
        if (room.hotel !== selectedHotel) return false;
        if (filter === "occupied") return room.is_occupied;
        if (filter === "available") return !room.is_occupied;
        if (bookingDetails.check_in == "" || bookingDetails.check_out == "") {
            return true;
        }
        // return true;
        const isRoomBooked = bookingList.some((booking) => {
            return (
                booking.room === room.id &&
                (bookingDetails.check_in > booking.check_out ||
                    bookingDetails.check_out < booking.check_in) === false
            );
        });
        return !isRoomBooked;
    });

    // Group rooms by floor for easier rendering
    const roomsByFloor = groupRoomsByFloor(filteredRooms);

    // Get sorted floor keys
    const sortedFloors = Object.keys(roomsByFloor).sort(sortFloors);

    useEffect(() => {
        const init = () => {
            loadUserType();
            loadHotels();
            loadBooking();
            loadRooms();
        };
        init();
    }, []);
    return (
        <>
            <h1 className="text-5xl mb-5">Rooms</h1>
            <div className="p-4">
                {/* Filter and Hotel Selection Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium">
                            Arrival Date:
                            <button
                                type="button"
                                className="bg-ternary mx-5 text-white px-2  rounded shadow-md hover:bg-quad transition duration-300"
                                onClick={() => resetDates()}
                            >
                                clear
                            </button>
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
                <div className="flex justify-between my-6">
                    <select
                        name="hotelId"
                        id="hotel"
                        onChange={handleHotelChange}
                        className="w-1/2 mr-2 px-4 py-2 text-lg text-gray-900 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition"
                    >
                        {hotelList.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                                {hotel.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="filter"
                        id="filter"
                        onChange={handleFilterChange}
                        className="w-1/2 px-4 py-2 text-lg text-gray-900 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="all">All Rooms</option>
                        <option value="occupied">Occupied</option>
                        <option value="available">Available</option>
                    </select>
                </div>

                {/* Display rooms grouped by floor */}
                {sortedFloors.map((floor) => (
                    <div key={floor} className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Floor: {floor}
                        </h2>
                        <div className="grid grid-cols-1 xl:grid-cols-10 gap-4">
                            {roomsByFloor[floor].map((room) => (
                                <div
                                    key={room.name}
                                    className={`p-4 border rounded-lg  h-36 shadow-md justify-between text-center relative transform transition-transform duration-300 hover:scale-105 ${
                                        room.is_occupied
                                            ? "bg-red-300 border-red-500"
                                            : "bg-green-300 border-green-500"
                                    }`}
                                >
                                    {userType === "Owner" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditRoomId((old) =>
                                                        old === room.id
                                                            ? null
                                                            : room.id
                                                    )
                                                }
                                                className="absolute top-2 right-2 hover:scale-105 text-gray-700 cursor-pointer"
                                            >
                                                {editRoomId !== room.id ? (
                                                    <FaEdit />
                                                ) : (
                                                    <IoCloseSharp />
                                                )}
                                            </button>
                                        </>
                                    )}
                                    <h3 className="text-xl font-bold mb-2">
                                        {room.name}
                                    </h3>
                                    <div className="min-h-8">
                                        <label htmlFor={room.id + "beds"}>
                                            Beds:
                                        </label>{" "}
                                        {editRoomId !== room.id ? (
                                            room.beds
                                        ) : (
                                            <input
                                                type="text"
                                                min={1}
                                                defaultValue={room.beds}
                                                name="beds"
                                                id={room.id + "beds"}
                                                className="w-4 m-0 h-4 inline"
                                                onChange={handleEditChange}
                                            />
                                        )}
                                    </div>
                                    <button
                                        hidden={editRoomId !== room.id}
                                        onClick={() => handleEditSubmit()}
                                        type="button"
                                        className=" bg-ternary text-white py-1 px-4 rounded hover:bg-quad transition"
                                    >
                                        Save
                                    </button>
                                    {/* {!room.is_occupied && ( */}
                                    <NavLink
                                        hidden={editRoomId === room.id}
                                        className="mt-4 bg-secondary text-white py-1 px-4 rounded hover:bg-primary transition"
                                        to="/dashboard/booking/create"
                                        state={{
                                            selectedHotel,
                                            roomId: room.id,
                                            roomName: room.name,
                                            roomBeds: room.beds,
                                            roomFloor: room.floor,
                                            bookingDetails: bookingDetails,
                                        }}
                                        // disabled={room.is_occupied}
                                    >
                                        Book
                                    </NavLink>
                                    {/* )} */}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default RoomView;
