import React, { useEffect, useState } from "react";
import api from "../../api";
import Form from "../form";
import { MdDelete } from "react-icons/md";
function ManagersView(props) {
    const [createView, setCreateView] = useState(false);
    const [managerList, setManagerList] = useState([]);
    const handleManagerRegister = () => {
        setCreateView(false);
        loadManagers();
    };
    const loadManagers = async () => {
        await api
            .get("/api/getmanagers/")
            .then((res) => {
                setManagerList(res.data);
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };
    const handleDeleteManager = async (managerId) => {
        await api
            .post("/api/manager/delete/", { manager: managerId })
            .then((res) => {
                alert("Manager deleted successfully.");
                loadManagers();
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };

    useEffect(() => {
        const init = () => {
            loadManagers();
        };
        init();
    }, []);
    return (
        <>
            {!createView ? (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-5xl mb-5">Managers</h1>

                        <button
                            type="button"
                            onClick={() => setCreateView(true)}
                            className="bg-secondary mx-5 text-white px-6 py-2 rounded shadow-md hover:bg-primary transition duration-300"
                        >
                            Add Manager
                        </button>
                    </div>
                    <div>
                        <table className="min-w-full">
                            <thead className="bg-white border-b">
                                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                                    Manger ID
                                </th>
                                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                                    Name
                                </th>
                                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                                    Phone Number
                                </th>
                                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                                    Hotlel
                                </th>
                                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left"></th>
                            </thead>
                            <tbody>
                                {managerList.map((manager, index) => (
                                    <>
                                        <tr key={index} className="border-b">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {manager.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {manager.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {manager.phone_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {manager.hotel}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteManager(
                                                            manager.id
                                                        )
                                                    }
                                                    className="text-2xl hover:scale-110 active:scale-90 transition duration-300"
                                                >
                                                    <MdDelete />
                                                </button>
                                            </td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-5xl mb-5">Add Manager</h1>

                    <div className="flex justify-center items-center ">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-7xl ">
                            <Form
                                method="register"
                                userType="Manager"
                                handleManagerRegister={() =>
                                    handleManagerRegister()
                                }
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
export default ManagersView;
