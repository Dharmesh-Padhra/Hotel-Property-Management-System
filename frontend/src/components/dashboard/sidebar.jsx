import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../api";
function Sidebar(props) {
    const normalStyle =
        "text-center p-3 hover:bg-primary hover:text-white font-semibold transition-all ease-in duration-100 ";
    const activeStyle =
        " text-center p-3 hover:bg-primary hover:text-white font-semibold transition-all ease-in duration-100 bg-secondary ";
    const [role, setRole] = useState();
    // const loadUserType = async () => {
    //     await api
    //         .get("/api/usertype/")
    //         .then((res) => setRole(res.data.role))
    //         .catch((res) => alert(res.response.data.detail));
    // };

    useEffect(() => {
        // const init = () => {
        //     loadUserType();
        // };
        // init();
    }, []);
    return (
        <>
            <div className="grid grid-cols-1 pt-3 divide-y-2 divide-quad">
                <NavLink
                    end
                    className={({ isActive }) =>
                        isActive ? activeStyle : normalStyle
                    }
                    to="/dashboard"
                >
                    Dashboard
                </NavLink>
                <NavLink
                    end
                    className={({ isActive }) =>
                        isActive ? activeStyle : normalStyle
                    }
                    to="/dashboard/booking"
                >
                    Bookings
                </NavLink>
                <NavLink
                    end
                    className={({ isActive }) =>
                        isActive ? activeStyle : normalStyle
                    }
                    to="/dashboard/rooms"
                >
                    Rooms
                </NavLink>
                <NavLink
                    end
                    className={({ isActive }) =>
                        isActive ? activeStyle : normalStyle
                    }
                    to="/dashboard/hotels"
                >
                    Hotels
                </NavLink>
                {props.role === "Owner" && (
                    <>
                        <NavLink
                            end
                            className={({ isActive }) =>
                                isActive ? activeStyle : normalStyle
                            }
                            to="/dashboard/managers"
                        >
                            Managers
                        </NavLink>
                    </>
                )}
                <NavLink
                    end
                    className={({ isActive }) =>
                        isActive ? activeStyle : normalStyle
                    }
                    to="/dashboard/profile"
                >
                    Profile
                </NavLink>
            </div>
        </>
    );
}
export default Sidebar;
