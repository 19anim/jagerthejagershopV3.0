import FloattingInput from "../floatting-input/floatting-input.component";
import { Link } from "react-router-dom";

const SignUpForm = () => {
  return (
    <div className="mt-5 w-full flex flex-col gap-3 items-center">
      <h2 className="text-2xl">
        <strong>Login</strong>
      </h2>
      <FloattingInput labelName="Email" />
      <FloattingInput labelName="Username" />
      <FloattingInput labelName="Password" />
      <div className="w-full flex justify-between text-mainOrange">
        <Link to="/user/sign-in">
          <p>Already a Meister? Here to login</p>
        </Link>
      </div>
      <button
        className="bg-[#769170] text-black w-full py-2 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_10px_#6e9f65]"
        type="submit"
      >
        Register
      </button>
    </div>
  );
};

export default SignUpForm;
