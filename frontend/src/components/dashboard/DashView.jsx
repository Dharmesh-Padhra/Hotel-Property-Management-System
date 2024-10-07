import React, { useEffect, useState } from "react";
import api from "../../api";
const CircleProgressBar = ({ percentage, hotelName }) => {
    const radius = 150; // Radius of the circle
    const stroke = 30; // Thickness of the progress bar
    const normalizedRadius = radius - stroke * 2; // Adjust the radius to account for the stroke
    const circumference = normalizedRadius * 2 * Math.PI; // Circumference of the circle
    const strokeDashoffset = circumference - (percentage / 100) * circumference; // Progress offset based on percentage

    return (
        <div className="inline-block text-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform transition-transform duration-300 hover:scale-110 inline-block"
            >
                <circle
                    stroke="#e5e7eb" // Light gray background circle
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#03AED2" // Progress bar color
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-stroke duration-300 ease-out"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="text-xl font-semibold text-gray-700"
                >
                    {percentage}%
                </text>
            </svg>
            {/* Display Hotel Name Below the Circle */}
            <p className="mt-1 mb-4 text-xl font-medium">{hotelName}</p>
        </div>
    );
};

function DashView(props) {
    const [overview, setOverview] = useState({});
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("");
    const loadUserType = async () => {
        await api
            .get("/api/usertype/")
            .then((res) => setRole(res.data.role))
            .catch((res) => alert(res.response.data.detail));
    };
    const loadDetails = async () => {
        api.get("/api/dashboard/")
            .then((res) => {
                setOverview(res.data);
            })
            .catch((err) => {
                alert("Error fetching details.");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    useEffect(() => {
        const init = () => {
            loadUserType();
            loadDetails();
        };
        init();
    }, []);
    if (loading) {
        return <>loading</>;
    }
    return (
        <>
            <h1 className="text-5xl mb-5">Overview</h1>
            <div className="flex gap-6 flex-row w-full mb-6 p-2">
                {role === "Owner" ? (
                    <>
                        <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                            <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                                <h1 className="text-7xl">
                                    {overview["total_hotels"] || 0}
                                </h1>
                            </div>
                            <h2 className="text-lg pt-2">Hotels</h2>
                        </div>
                        <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                            <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                                <h1 className="text-7xl">
                                    {overview["total_rooms"] || 0}
                                </h1>
                            </div>
                            <h2 className="text-lg pt-2">Total Rooms</h2>
                        </div>
                        <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                            <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                                <h1 className="text-7xl">
                                    {overview.overall_occupancy?.toFixed(2) ||
                                        0}
                                    %
                                </h1>
                            </div>
                            <h2 className="text-lg pt-2">Overall Occupancy</h2>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                            <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                                <h1 className="text-7xl">
                                    {overview["available_rooms"] || 0}
                                </h1>
                            </div>
                            <h2 className="text-lg pt-2">Available Rooms</h2>
                        </div>
                        <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                            <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                                <h1 className="text-7xl">
                                    {overview["occupied_rooms"] || 0}
                                </h1>
                            </div>
                            <h2 className="text-lg pt-2">Occupied Rooms</h2>
                        </div>
                        <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                            <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                                <h1 className="text-7xl">
                                    {overview["total_rooms"] || 0}
                                </h1>
                            </div>
                            <h2 className="text-lg pt-2">Total Rooms</h2>
                        </div>
                    </>
                )}
                {/* <div className="flex-1 text-center overflow-hidden h-48 bg-secondary rounded-xl">
                    <div className="text-center w-full h-[75%] pt-7 bg-red-100">
                        <h1 className="text-7xl">
                            {overview["todaysBooking"]}
                        </h1>
                    </div>
                    <h2 className="text-lg pt-2">Todays Booking</h2>
                </div> */}
            </div>
            {role === "Owner" && (
                <>
                    <h1 className="text-5xl mb-5">Hotel Occupancy</h1>
                    <div className="overflow-x-scroll flex space-x-8">
                        {overview.hotels && overview.hotels.length > 0 ? (
                            overview.hotels
                                .sort((a, b) => {
                                    return b.occupancy - a.occupancy;
                                })
                                .map((hotel) => (
                                    <CircleProgressBar
                                        percentage={
                                            hotel.occupancy.toFixed(2) || 0
                                        }
                                        hotelName={hotel.name || ""}
                                    />
                                ))
                        ) : (
                            <p>No hotels created.</p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
export default DashView;
