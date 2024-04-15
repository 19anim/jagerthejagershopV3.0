import LoadingGif from "../../assets/loading-spinner.gif";
import "./loading-spinner.styles.css";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <img src={LoadingGif} alt="" />
      <div className=" inline-block">
        <p className="loading-spinner--text">Loading... Please wait</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
