const FitButton = ({ children, ...otherProps }) => {
    return (
      <button
        className="brand-button w-fit"
        {...otherProps}
      >
        {children}
      </button>
    );
  };

  export default FitButton;
