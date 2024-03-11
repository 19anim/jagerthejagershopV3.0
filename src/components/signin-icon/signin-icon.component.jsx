import { Link } from "react-router-dom";

const SignInIcon = () => {
  return (
    <Link to="/user/sign-in">
      <ion-icon name="person-circle-outline" class="text-2xl"></ion-icon>
    </Link>
  );
};

export default SignInIcon;
