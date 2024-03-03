const CheckBoxField = ({ label, inputOption}) => {
    const {attributeName} = inputOption;
    return (
      <div key={attributeName} className="flex flex-col gap-3 text-[20px]">
        <label htmlFor={attributeName}>{label}</label>
        <input
          className="text-black w-[20px] h-[20px]"
          {...inputOption}
        />
      </div>
    );
  };
  
  export default CheckBoxField;
  