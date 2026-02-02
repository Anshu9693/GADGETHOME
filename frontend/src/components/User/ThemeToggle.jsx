// import React, { useEffect, useState } from "react";
// import { FaSun, FaMoon } from "react-icons/fa";

// const ThemeToggle = () => {
//   const [theme, setTheme] = useState(() => localStorage.getItem("gh_theme") || "dark");

//   useEffect(() => {
//     if (theme === "dark") document.documentElement.classList.add("dark");
//     else document.documentElement.classList.remove("dark");
//     localStorage.setItem("gh_theme", theme);
//   }, [theme]);

//   return (
//     <button
//       onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
//       className="px-3 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
//       title="Toggle theme"
//     >
//       {theme === "dark" ? <FaSun /> : <FaMoon />}
//     </button>
//   );
// };

// export default ThemeToggle;
