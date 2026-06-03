const DropdownButton = ({ children, ...otherProps }) => {
  return (
    <button
      className="brand-button w-[50%]"
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default DropdownButton;
