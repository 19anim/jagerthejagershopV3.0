import { useNavigate } from "react-router-dom";

const CategoryItem = ({ category }) => {
  const { image, name, slug } = category;
  const navigate = useNavigate();
  const onClickHandler = () => navigate(slug);
  return (
    <div
      onClick={onClickHandler}
      className="group hover:cursor-pointer min-w-[30%] flex flex-[1_1_auto] justify-center items-center h-[360px] overflow-hidden mx-[7.5px] mb-[15px]"
    >
      <div
        className="group-hover:scale-[1.1] group-hover:ease-in group-hover:transition-transform group-hover:duration-300 w-[100%] h-[100%] bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      <div className="group-hover:opacity-90 flex flex-col justify-center items-center border-black border-[1px] absolute bg-white px-[25px] opacity-70">
        <h2 className="font-bold text-[#4a4a4a]">{name}</h2>
        <p className="text-black">Shop now</p>
      </div>
    </div>
  );
};

export default CategoryItem;
