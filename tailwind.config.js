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
  plugins: [],
};
