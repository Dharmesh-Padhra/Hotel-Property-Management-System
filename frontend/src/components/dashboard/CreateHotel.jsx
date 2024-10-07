import React, { useEffect, useState } from "react";
import defaultHotelImage from "../../images/hotel.jpg";
import api from "../../api";
import { redirect, useNavigate } from "react-router-dom";
function CreateHotel(props) {
    const navigate = useNavigate();
    const inputClasses =
        "rounded-full bg-quad focus:outline-secondary h-10 w-64 pl-4";
    const [hotelImage, setHotelImage] = useState(null);
    const [hotelUrl, setHotelUrl] = useState("");
    const [floorRooms, setFloorRooms] = useState([]);
    const [hotel, setHotel] = useState({
        name: "",
        email: "",
        phone_number: "",
        address: "",
        floors: 0,
        ground_floor_rooms: 0,
    });
    const handleGroundFloorRooms = (e) => {
        const newVal = parseInt(e.target.value, 10);
        setHotel({ ...hotel, [e.target.name]: newVal });
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setHotelImage(file);
            setHotelUrl(URL.createObjectURL(file));
        }
    };
    const handleFloorRoomsChange = (index, field, value) => {
        const updatedFloorRooms = [...floorRooms];
        updatedFloorRooms[index][field] = value;
        setFloorRooms(updatedFloorRooms);
    };
    const handleFloorsChange = (e) => {
        const newFloorCount = parseInt(e.target.value, 10);
        setHotel({
            ...hotel,
            floors: newFloorCount,
        });

        const updatedFloorRooms = Array.from(
            { length: newFloorCount },
            (v, i) => ({
                floor: i + 1,
                rooms: floorRooms[i] ? floorRooms[i].rooms : 0,
            })
        );

        setFloorRooms(updatedFloorRooms);
    };

    const handleHotelChange = (e) => {
        const { name, value } = e.target;
        if (name == "phone_number") {
            setHotel({
                ...hotel,
                [name]: value.replace(/\D/g, ""),
            });
        } else {
            setHotel({
                ...hotel,
                [name]: value,
            });
        }
    };
    useEffect(() => {}, []);

    // const a = {
    //     'hotel': {
    //         name:"",
    //         email:"",
    //         phone:"",
    //         address:"",
    //         floors:"",
    //         name:"",
    //     },
    //     floorRooms: [
    //         {
    //             floor:1,
    //             rooms:4
    //         },
    //         {
    //             floor:2,
    //             rooms:3
    //         },
    //     ],
    // }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (hotelImage) {
            formData.append("image", hotelImage);
        }
        const total_rooms =
            floorRooms.reduce((acc, cur) => acc + cur.rooms, 0) +
            hotel.ground_floor_rooms;
        var hotelData = hotel;
        hotelData = { ...hotelData, total_rooms };
        const data = JSON.stringify({ hotel: hotelData, floorRooms });
        formData.append("data", data);
        await api
            .post("/api/hotel/create/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                alert("Hotel Created Successfully.");
                navigate("/dashboard/hotels/");
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };

    return (
        <>
            <h1 className="text-5xl mb-5">Create Hotel</h1>
            <form
                className="text-xl shadow-[rgb(38,57,77)_0px_20px_30px_-10px] border-primary b rounded-lg p-5 mr-40"
                onSubmit={handleSubmit}
                autoComplete
            >
                <fieldset className="border border-2 border-primary mt-4">
                    <legend className="text-2xl text-white p-2 rounded-full  m-5 bg-primary">
                        Details
                    </legend>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="row-span-5 p-4">
                            <div className="relative  rounded-2xl w-64 h-48 overflow-hidden">
                                <img
                                    src={hotelUrl || defaultHotelImage}
                                    alt="profilePreview"
                                    className="object-cover w-full h-full object-center"
                                />
                                <label
                                    htmlFor="profileUpload"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer "
                                >
                                    <span className="text-white text-sm font-medium">
                                        Change Image
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    id="profileUpload"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="hotelName">Hotel Name* </label>
                            <br />
                            <input
                                type="text"
                                name="name"
                                id="hotelName"
                                required
                                value={hotel.name}
                                onChange={handleHotelChange}
                                className={inputClasses}
                            />
                        </div>
                        <div className="grid grid-cols-subgrid col-start-2 col-span-2 gap-4">
                            <div className="">
                                <label htmlFor="email">Email </label>
                                <br />
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    value={hotel.email}
                                    onChange={handleHotelChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="">
                                <label htmlFor="phNo">Phone Number </label>
                                <br />
                                <input
                                    type="text"
                                    name="phone_number"
                                    id="phNo"
                                    value={hotel.phone_number}
                                    onChange={handleHotelChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="address">Address </label>
                                <br />
                                <input
                                    type="text"
                                    name="address"
                                    value={hotel.address}
                                    onChange={handleHotelChange}
                                    id="address"
                                    className={inputClasses + " w-[90%]"}
                                />
                            </div>
                            <div>
                                <label htmlFor="floors">Floors* </label>
                                <br />
                                <input
                                    type="number"
                                    name="floors"
                                    id="floors"
                                    min={0}
                                    onChange={handleFloorsChange}
                                    value={hotel.floors}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="border border-2 border-primary mt-4">
                    <legend className="text-2xl text-white p-2 rounded-full  m-5 bg-primary">
                        Room management
                    </legend>
                    <table className="table-fixed text-center border-collapse border border-slate-200 w-[96%] m-5">
                        <thead>
                            <tr>
                                <th className="border border-slate-200 p-3">
                                    Floors
                                </th>
                                <th className="border border-slate-200 p-3">
                                    Rooms
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 p-3">
                                    Ground Floor
                                </td>
                                <td className="border border-slate-200 p-3">
                                    <input
                                        type="number"
                                        className="text-center w-32"
                                        min={0}
                                        name="ground_floor_rooms"
                                        value={hotel.ground_floor_rooms}
                                        onChange={handleGroundFloorRooms}
                                    />
                                </td>
                            </tr>
                            {floorRooms.map((floorRoom, index) => (
                                <>
                                    <tr key={index}>
                                        <td className="border border-slate-200 p-3">
                                            Floor {floorRoom.floor}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                            <input
                                                type="number"
                                                value={floorRoom.rooms}
                                                onChange={(e) =>
                                                    handleFloorRoomsChange(
                                                        index,
                                                        "rooms",
                                                        parseInt(
                                                            e.target.value,
                                                            10
                                                        )
                                                    )
                                                }
                                                className="text-center w-32"
                                                min={0}
                                            />
                                        </td>
                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </table>
                </fieldset>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="d-inline-block m-4 bg-ternary text-white py-2 px-4 rounded-lg shadow-md font-semibold text-lg hover:bg-quad"
                    >
                        Create Hotel
                    </button>
                </div>
            </form>
            {/* <h1>{JSON.stringify({ hotel, floorRooms })}</h1> */}
        </>
    );
}

export default CreateHotel;
