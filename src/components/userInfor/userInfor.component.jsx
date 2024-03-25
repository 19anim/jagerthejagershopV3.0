import { UserContext } from "../../context/user.context";
import { useContext } from "react";
import { Link } from "react-router-dom";
import Button from "../button/button.component";

const UserInfor = () => {
  const { isLoggedIn, userInfor } = useContext(UserContext);
  return (
    <div className="mt-5 w-[80%] grid grid-cols-[30%_70%]">
      <img src="../src/assets/avatar.png" className="w-[150px]" alt="Avatar" />
      <div className="flex flex-col gap-5">
        <div className="flex justify-between">
          <div>
            <p>Full name</p>
            <p>{userInfor.userName}</p>
          </div>
          <div>
            <p>Phone number</p>
            <p>
              {!userInfor.phoneNumber
                ? "Not Filled yet"
                : userInfor.phoneNumber}
            </p>
          </div>
          <div>
            <p>Email</p>
            <p>{userInfor.email}</p>
          </div>
        </div>
        <hr></hr>
        <div>
          <p>Receipent name</p>
          <p>{!userInfor.receipentName ? "Not Filled yet" : userInfor.receipentName}</p>
        </div>
        <div>
          <p>Address</p>
          <p>{!userInfor.address ? "Not Filled yet" : userInfor.address}</p>
        </div>
        <Link to="/user/updateInformation" className="self-center w-full">
          <Button>
            Update User Information
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UserInfor;
