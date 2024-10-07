import React, { useEffect, useState } from "react";
import api from "../../api";
import { NavLink } from "react-router-dom";

const BookingView = () => {
    // State for selecting hotel, room, and guest details
    const [hotelList, setHotelList] = useState([]);
    const [operation, setOperation] = useState("");
    const [roomList, setRoomList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(-1);
    const [role, setRole] = useState("");
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
    const loadCustomers = async () => {
        await api
            .get("/api/getcustomers/")
            .then((res) => setCustomerList(res.data))
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };
    const getUserType = async () => {
        try {
            const res1 = await api.get("/api/usertype/");
            setRole(res1.data.role);
            return res1.data.role;
        } catch (error) {
            console.log(error);
        }
    };
    const handleHotelChange = (e) => {
        setSelectedHotel(parseInt(e.target.value, 10));
    };

    // Function to get room name by id
    const getRoomName = (roomId) => {
        const room = roomList.find((room) => room.id === roomId);
        return room ? room.name : "Unknown Room";
    };
    const getRoomIsOccupied = (roomId) => {
        const room = roomList.find((room) => room.id === roomId);
        return room ? room.is_occupied : false;
    };

    // Function to get customer details by id
    const getCustomerDetails = (customerId) => {
        const customer = customerList.find(
            (customer) => customer.id === customerId
        );
        return customer;
    };
    const handleOperation = async (bookingId) => {
        await api
            .post("/api/booking/operation/", {
                booking: bookingId,
                operation,
            })
            .then((res) => {
                loadRooms();
                loadBooking();
                loadCustomers();
                alert(res.data.detail);
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };

    useEffect(() => {
        const init = () => {
            getUserType();
            loadCustomers();
            loadHotels();
            loadBooking();
            loadRooms();
        };
        init();
    }, []);
    if (!roomList || !customerList || !bookingList) {
        return <>Loading</>;
    }
    return (
        <>
            <h1 className="text-5xl mb-5">Bookings</h1>
            <div className="my-3">
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
                {hotelList && hotelList.length > 0 ? (
                    <NavLink
                        to="create"
                        className="mt-4 bg-secondary text-white py-1 px-4 py-2 rounded hover:bg-primary transition"
                        state={{ selectedHotel }}
                    >
                        New Booking
                    </NavLink>
                ) : (
                    <></>
                )}
            </div>
            <div>
                <table className="min-w-full">
                    <thead className="bg-white border-b">
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                            Booking ID
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                            Guest
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                            Phone Number
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                            Room
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                            Operations
                        </th>
                    </thead>
                    <tbody>
                        {bookingList
                            .filter((booking) => {
                                return booking.hotel === selectedHotel;
                            })
                            .map((booking, index) => {
                                const customer = getCustomerDetails(
                                    booking.customer
                                );
                                if (!customer) {
                                    return (
                                        <>
                                            <tr>
                                                <td>loading</td>
                                                <td>loading</td>
                                                <td>loading</td>
                                                <td>loading</td>
                                                <td>loading</td>
                                            </tr>
                                        </>
                                    );
                                }

                                return (
                                    <tr
                                        key={index}
                                        className={`border-b ${
                                            getRoomIsOccupied(booking.room)
                                                ? "bg-red-300 border-red-500"
                                                : "bg-green-300 border-green-500"
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {booking.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {`${customer.first_name} ${customer.last_name}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {customer.phone_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {getRoomName(booking.room)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <select
                                                name="operation"
                                                value={operation}
                                                onChange={(e) =>
                                                    setOperation(e.target.value)
                                                }
                                            >
                                                <option
                                                    disabled
                                                    hidden
                                                    value=""
                                                >
                                                    Select Operation
                                                </option>
                                                <option value="cancel">
                                                    Cancel Booking
                                                </option>
                                                <option value="checkin">
                                                    Check in Guest
                                                </option>
                                                <option value="checkout">
                                                    Check out Guest
                                                </option>
                                            </select>
                                            <button
                                                type="button"
                                                disabled={operation == ""}
                                                onClick={() =>
                                                    handleOperation(booking.id)
                                                }
                                                className="mx-3 bg-ternary text-white px-2 rounded hover:bg-quad transition"
                                            >
                                                Go
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BookingView;
