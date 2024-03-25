const Button = ({ children, ...otherProps }) => {
  return (
    <button
      className="bg-[#769170] text-black w-full py-2 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_10px_#6e9f65]"
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default Button;
