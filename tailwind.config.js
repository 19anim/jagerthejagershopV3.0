/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'mainOrange': "#ffa827",
        'mainOrange-50': "#ffd9a2",
        'mainGreen': "#293124",
        'wheat': "#f5deb3"
      },
    },
  },
  plugins: [
    function({addUtilities}){
      const newUtilities = {
        ".scrollbar-black": {
          scrollbarColor: "black transparent" 
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
