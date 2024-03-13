import FloattingInput from "../floatting-input/floatting-input.component";
import { Link } from "react-router-dom";

const SignInForm = () => {
  return (
    <div className="mt-5 w-full flex flex-col gap-3 items-center">
      <h2 className="text-2xl">
        <strong>Login</strong>
      </h2>
      <FloattingInput labelName="Username" />
      <FloattingInput labelName="Password" />
      <div className="w-full flex justify-between text-mainOrange">
        <Link to="/user/forgot-password">
          <p>Forgot your password?</p>
        </Link>
        <Link to="/user/sign-up">
          <p>New Meister?</p>
        </Link>
      </div>
      <button
        className="bg-[#769170] text-black w-full py-2 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_10px_#6e9f65]"
        type="submit"
      >
        Login
      </button>
    </div>
  );
};

export default SignInForm;
