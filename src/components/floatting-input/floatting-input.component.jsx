const FloattingInput = ({ inputOption, labelName }) => {
  return (
    <div className="relative flex flex-col w-full">
      <input
        className="peer/input focus:border-mainOrange transition-all bg-mainGreen outline-none p-[10px] rounded-md border border-[#ffffff40]"
        {...inputOption}
      />
      <span
        className={`${
          inputOption.value.length
            ? "absolute p-[0_10px] transition-all translate-x-2 translate-y-[-10px] pointer-events-none bg-mainGreen text-mainOrange"
            : "absolute p-[10px] transition-all text-[#ffffff40] left-0 pointer-events-none peer-focus/input:translate-y-[-10px] peer-focus/input:translate-x-[8px] peer-focus/input:p-[0px_10px] peer-focus/input:bg-mainGreen peer-focus/input:text-mainOrange"
        }`}
      >
        {labelName}
      </span>
    </div>
  );
};

export default FloattingInput;
