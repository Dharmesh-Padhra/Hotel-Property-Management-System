import React, { useState } from "react";
import { ArrowRight, Hotel, Calendar, Users, BarChart } from "lucide-react";
import img1 from "../images/home-1.jpg";
import api from "../api";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleContactSubmit = async (e) => {
        e.preventDefault();
        await api
            .post("/api/contactus/", { name, email, message })
            .then((res) => {
                alert("We recieved your query. We will reply soon.");
                setEmail("");
                setName("");
                setMessage("");
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };
    return (
        <div id="home" className="min-h-screen bg-gray-100">
            <section
                style={{ backgroundImage: `url(${img1})` }}
                className="relative h-screen flex items-center justify-center text-white bg-cover bg-center"
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative text-center px-4">
                    <h1 className="text-7xl font-bold mb-4">
                        Elevate Your Hotel Management
                    </h1>
                    <p className="text-2xl mb-8">
                        Streamline operations, boost efficiency, and delight
                        your guests
                    </p>
                    <button
                        onClick={() => {
                            navigate("/register");
                        }}
                        className="bg-ternary font-bold py-3 px-8 rounded-full hover:bg-quad transition duration-300"
                    >
                        Get Started
                    </button>
                </div>
            </section>

            <section className="py-20 px-4" id="services">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        Why Choose Us?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Hotel,
                                title: "Smart Booking",
                                desc: "Effortless reservation management",
                            },
                            {
                                icon: Calendar,
                                title: "Real-time Availability",
                                desc: "Up-to-date room status",
                            },
                            {
                                icon: Users,
                                title: "Guest Services",
                                desc: "Enhance guest experiences",
                            },
                            {
                                icon: BarChart,
                                title: "Insightful Analytics",
                                desc: "Data-driven decision making",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                            >
                                <feature.icon className="w-12 h-12 text-ternary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div id="about">
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8">About Us</h2>
                        <p className="text-xl mb-8">
                            At Ease Hotel, we're passionate about
                            revolutionizing hotel management. Our platform is
                            designed to empower hoteliers with cutting-edge
                            tools and insights, enabling them to deliver
                            exceptional guest experiences while optimizing their
                            operations.
                        </p>
                        <p className="text-xl">
                            With years of industry expertise and a commitment to
                            innovation, we're your trusted partner in navigating
                            the evolving landscape of hospitality management.
                        </p>
                    </div>
                </section>
                <section className="bg-primary py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">
                            Ready to Transform Your Hotel Operations?
                        </h2>
                        <p className="text-xl mb-8">
                            Join thousands of successful hoteliers using our
                            platform
                        </p>
                        <button
                            className="bg-ternary font-bold py-3 px-8 rounded-full hover:bg-quad transition duration-300 flex items-center mx-auto"
                            onClick={() => {
                                navigate("/register");
                            }}
                        >
                            Get Started <ArrowRight className="ml-2" />
                        </button>
                    </div>
                </section>
                {/* 
                <section className="py-20 px-4 bg-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">
                            What Our Clients Say
                        </h2>
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-xl italic mb-4">
                                "This platform has revolutionized how we manage
                                our hotel. The efficiency gains are remarkable,
                                and our guests love the seamless experience!"
                            </p>
                            <div className="flex items-center">
                                <img
                                    src="/api/placeholder/100/100"
                                    alt="Client"
                                    className="w-12 h-12 rounded-full mr-4"
                                />
                                <div>
                                    <p className="font-semibold">Jane Doe</p>
                                    <p className="text-gray-600">
                                        Manager, Luxury Hotel & Spa
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> */}
            </div>

            <section id="contact" className="py-20 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        Contact Us
                    </h2>
                    <form
                        className="space-y-6"
                        onSubmit={(e) => handleContactSubmit(e)}
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>
                            <input
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                id="name"
                                name="name"
                                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-ternary focus:ring focus:ring-ternary focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                name="email"
                                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-ternary focus:ring focus:ring-ternary focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="4"
                                value={message}
                                required
                                onChange={(e) => setMessage(e.target.value)}
                                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-ternary focus:ring focus:ring-ternary focus:ring-opacity-50"
                            ></textarea>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-ternary text-white font-bold py-2 px-4 rounded-full hover:bg-quad transition duration-300"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 px-4">
                <div className="max-w-6xl mx-auto flex flex-wrap justify-between">
                    <div className="w-full md:w-1/4 mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold mb-4">Ease Hotel</h3>
                        <p>Empowering hoteliers worldwide</p>
                    </div>
                    <div className="w-full md:w-1/4 mb-6 md:mb-0">
                        <h4 className="text-lg font-semibold mb-4">
                            Quick Links
                        </h4>
                        <ul>
                            <li>
                                <button
                                    onClick={() => {
                                        props.scrollToSection("home");
                                    }}
                                    className="hover:text-blue-400"
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        props.scrollToSection("services");
                                    }}
                                    className="hover:text-blue-400"
                                >
                                    Services
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        props.scrollToSection("contact");
                                    }}
                                    className="hover:text-blue-400"
                                >
                                    Contact
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        props.scrollToSection("about");
                                    }}
                                    className="hover:text-blue-400"
                                >
                                    About
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/4 mb-6 md:mb-0">
                        <h4 className="text-lg font-semibold mb-4">
                            Contact Us
                        </h4>
                        <p>Sardar Colony, Naranpura, Ahmedabad, India</p>
                        <p>contact@easehotel.com</p>
                        <p>+91 9408109631</p>
                    </div>
                    <div className="w-full md:w-1/4">
                        <h4 className="text-lg font-semibold mb-4">
                            Follow Us
                        </h4>
                        <div className="flex space-x-4">
                            <a href="fb.com" className="hover:text-blue-400">
                                Facebook
                            </a>
                            <a href="x.com" className="hover:text-blue-400">
                                Twitter
                            </a>
                            <a
                                href="linkedin.com"
                                className="hover:text-blue-400"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
