const Button = ({ children, ...otherProps }) => {
  return (
    <button
      className="brand-button w-full"
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default Button;
