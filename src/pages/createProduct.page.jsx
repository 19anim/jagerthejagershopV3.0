import axios from "axios";
import { useState, useContext } from "react";
import DropdownList from "../components/dropdown-list/dropdown-list.component";
import InputField from "../components/inputField/inputField.component";
import CheckBoxField from "../components/checkbox/checkbox.component";
import { CategoriesContext } from "../context/categories.context";

const defaultProductInfor = {
  name: "",
  description: "",
  image: "",
  vol: "",
  price: "",
  priceInInteger: 0,
  isBestSeller: false,
  soldAmount: 0,
  stock: 0,
  category: "",
  slug: "",
};

const CreateProductPage = () => {
  const CREATEPRODUCT_API_URL =
    import.meta.env.VITE_API_URL_CREATEPRODUCT || VITE_API_URL_CREATEPRODUCT;
  const [productInfor, setProductInfor] = useState(defaultProductInfor);
  const {
    name,
    description,
    image,
    vol,
    price,
    priceInInteger,
    isBestSeller,
    stock,
    category,
    slug,
  } = productInfor;

  const categoriesContextValue = useContext(CategoriesContext);

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setProductInfor({
      ...productInfor,
      [name]: value,
    });
  };

  const handleOnChangeCheckbox = (event) => {
    const { name } = event.target;
    setProductInfor({
      ...productInfor,
      [name]: !isBestSeller,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post(CREATEPRODUCT_API_URL, productInfor);
      if (res.status === 200) {
        setProductInfor(defaultProductInfor);
        alert("Product added");
      }
    } catch (error) {
      console.log(error.code);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-x-3">
          <InputField
            label="Tên sản phẩm"
            inputOption={{
              onChange: handleOnChange,
              name: "name",
              value: name,
            }}
          />
          <InputField
            label="Mô tả sản phẩm"
            inputOption={{
              onChange: handleOnChange,
              name: "description",
              value: description,
            }}
          />
          <InputField
            label="Link ảnh sản phẩm"
            inputOption={{
              onChange: handleOnChange,
              name: "image",
              value: image,
            }}
          />
          <InputField
            label="Dung tích sản phẩm"
            inputOption={{
              onChange: handleOnChange,
              name: "vol",
              value: vol,
            }}
          />
          <InputField
            label="Giá sản phẩm bằng chữ"
            inputOption={{
              onChange: handleOnChange,
              name: "price",
              value: price,
            }}
          />
          <InputField
            label="Giá sản phẩm bằng số"
            inputOption={{
              onChange: handleOnChange,
              name: "priceInInteger",
              value: priceInInteger,
            }}
          />
          <InputField
            label="Số lượng tồn kho"
            inputOption={{
              onChange: handleOnChange,
              name: "stock",
              value: stock,
            }}
          />
          <DropdownList
            label="Phân loại sản phẩm"
            options={categoriesContextValue.categories}
            inputOption={{
              name: "category",
              onChange: handleOnChange,
              value: category,
            }}
          />
          <CheckBoxField
            label="Best seller?"
            inputOption={{
              checked: isBestSeller,
              onChange: handleOnChangeCheckbox,
              name: "isBestSeller",
              value: isBestSeller,
              type: "checkbox",
            }}
          />
        </div>
        <button
          type="submit"
          className="mt-5 w-[200px] px-2 py-1 rounded-lg text-black bg-white"
        >
          Thêm sản phẩm
        </button>
      </form>
    </>
  );
};

export default CreateProductPage;
