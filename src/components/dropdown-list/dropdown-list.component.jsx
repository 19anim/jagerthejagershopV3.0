const DropdownList = ({ label, options, inputOption }) => {
  const { attributeName } = inputOption;
  return (
    <div className="flex flex-col gap-3 text-[20px]">
      <label htmlFor={attributeName}>{label}</label>
      <select className="text-black rounded-md py-1 px-3" {...inputOption}>
      <option value="-1">Please select</option>
        {options &&
          options.map((option) => {
            return (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            );
          })}
      </select>
    </div>
  );
};

export default DropdownList;
