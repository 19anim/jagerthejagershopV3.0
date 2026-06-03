const ErrorMessage = ({ errorMessage }) => {
  return (
    <div className="w-full border border-red-400/35 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100">
      {errorMessage}
    </div>
  );
};

export default ErrorMessage;
