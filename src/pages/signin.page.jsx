const SignInPage = () => {
  const BACKGROUND_IMAGE =
    "https://images.ctfassets.net/86v07ri6w8tx/2MwCifMF5eEmkiUGYUI4S2/079f5123b150a37c839c62d2208176fd/teaser_history.jpg?&w=1366&q=66&fl=progressive";
  return (
    <div className="grid grid-cols-[40%_60%] gap-3 bg-mainGreen rounded-3xl p-3">
      <div>
        <img className=" rounded-3xl" src={BACKGROUND_IMAGE} alt="a" />
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="w-fit bg-white text-black relative rounded-3xl">
          <div className="w-[50%] h-full bg-mainOrange absolute rounded-3xl top-0 left-0"></div>
          <button className="text-center w-[100px] px-3 py-2 relative">Login</button>
          <button className="text-center w-[100px] px-3 py-2 relative">Register</button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <img
            className="w-[50px] h-[50px]"
            src="../src/assets/logo.png"
            alt=""
          />
          <h2 className="text-xl">Welcome to <strong>JAGERTHEJAGER SHOP</strong></h2>
          <h3 className="text-sm">Ở đây iem bán thuốc ho con hươu shop</h3>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
