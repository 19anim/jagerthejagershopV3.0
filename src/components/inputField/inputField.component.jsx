const InputField = ({ label, inputOption}) => {
  const {attributeName} = inputOption;
  return (
    <div key={attributeName} className="flex flex-col gap-3 text-[20px]">
      <label htmlFor={attributeName}>{label}</label>
      <input
        className="text-black rounded-md py-1 px-3"
        {...inputOption}
      />
    </div>
  );
};

export default InputField;
