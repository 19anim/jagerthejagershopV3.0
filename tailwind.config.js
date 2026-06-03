/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'mainOrange': "#dd5a12",
        'mainOrange-50': "#f4b487",
        'mainGreen': "#1e3027",
        'midGreen': "#31533e",
        'cream': "#f3efe3",
        'warmGold': "#b8922e",
        'ink': "#182018",
        'wheat': "#f5deb3"
      },
      fontFamily: {
        heading: ["Noto Sans", "sans-serif"],
        body: ["Noto Sans", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [
    function({addUtilities}){
      const newUtilities = {
        ".scrollbar-black": {
          scrollbarColor: "black transparent" 
        },
        ".scrollbar-gray": {
          scrollbarColor: "#6d6d6d transparent" 
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "15px"
          },
          "&::-webkit-scrollbar-track": {
            background: "white"
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgb(31 41 55)",
            borderRadius: "20px",
            border: "1px solid white"
          }
        }
      }

      addUtilities(newUtilities, ["responsive", "hover"])
    }
  ],
};
