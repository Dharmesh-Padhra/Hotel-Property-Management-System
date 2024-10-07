import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";
import api from "../../api";
function Dashboard(props) {
    const [role, setRole] = useState();
    const loadUserType = async () => {
        await api
            .get("/api/usertype/")
            .then((res) => setRole(res.data.role))
            .catch((res) => alert(res.response.data.detail));
    };
    useEffect(() => {
        const init = () => {
            setRole(props.role)
            loadUserType();
        };
        init();
    }, []);
    return (
        <>
            <div className="grid grid-cols-6 h-full p-4 ">
                <div className="shadow-xl bg-ternary mr-2 rounded-xl">
                    <Sidebar role={role} />
                </div>
                <div className="shadow-xl col-span-5 ml-2 p-8 rounded-xl bg-slat-50 overflow-y-scroll overflow-x-hidden">
                    <Outlet />
                </div>
            </div>
        </>
    );
}
export default Dashboard;
