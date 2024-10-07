import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserDropdown from "./userdropdown";

function Navbar(props) {
    const [activeSection, setActiveSection] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const activeLink = "block py-2 px-3 rounded-full bg-secondary text-white";
    const normalLink =
        "block py-2 px-3 rounded-full hover:bg-primary hover:text-white transition-all ease-in duration-100";

    

    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const sectionId = location.state.scrollTo;
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [location.state]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "services", "about", "contact"];
            let currentSection = "";

            sections.forEach((section) => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom > 150) {
                        currentSection = section;
                    }
                }
            });

            if (currentSection && currentSection !== activeSection) {
                setActiveSection(currentSection);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [activeSection]);

    return (
        <>
            <nav className="fixed z-10 top-0 w-full bg-ternary shadow-lg">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" className="h-7" alt="E Logo" />
                        <span className="self-start text-2xl font-semibold whitespace-nowrap">
                            ase Hotel
                        </span>
                    </Link>

                    <ul className="font-medium flex p-0 flex-row space-x-8 mt-0">
                        <li className="relative inline-block text-left">
                            <button
                                onClick={() => props.scrollToSection("home")}
                                className={
                                    activeSection === "home"
                                        ? activeLink
                                        : normalLink
                                }
                            >
                                Home
                            </button>
                        </li>
                        <li className="relative inline-block text-left">
                            <button
                                onClick={() => props.scrollToSection("services")}
                                className={
                                    activeSection === "services"
                                        ? activeLink
                                        : normalLink
                                }
                            >
                                Services
                            </button>
                        </li>
                        <li className="relative inline-block text-left">
                            <button
                                onClick={() => props.scrollToSection("about")}
                                className={
                                    activeSection === "about"
                                        ? activeLink
                                        : normalLink
                                }
                            >
                                About us
                            </button>
                        </li>
                        <li className="relative inline-block text-left">
                            <button
                                onClick={() => props.scrollToSection("contact")}
                                className={
                                    activeSection === "contact"
                                        ? activeLink
                                        : normalLink
                                }
                            >
                                Contact us
                            </button>
                        </li>

                        <li className="relative inline-block text-left">
                            <UserDropdown isLoggedin={props.isLoggedin} />
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
