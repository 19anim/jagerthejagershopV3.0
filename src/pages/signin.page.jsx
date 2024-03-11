const SignInPage = () => {
  return (
    <div className="grid grid-cols-[40%_60%] bg-mainGreen rounded-3xl">
      <div>
        <img src="../src/assets/logo.png" alt="a" />
      </div>
      <div>
        <div>
          <div className="flex gap-5">
            <button className="bg-mainOrange text-black px-3 py-1">
              Login
            </button>
            <button>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
