import React from "react"
import Form from "./form"
function Login(props) {
    return(
        <div className="flex justify-center items-center h-[100%] bg-gray-100 bg-gradient-to-r from-teal-400 to-yellow-200">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <Form method='login' loadRole={()=>props.loadRole()} changeLogIn={props.changeLogIn}/>
        </div>
        </div>
    )
}
export default Login