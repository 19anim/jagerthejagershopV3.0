import { Routes, Route } from "react-router-dom";
import SignInPage from "./signin.page";

const UserPage = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
    </Routes>
  );
};

export default UserPage;
