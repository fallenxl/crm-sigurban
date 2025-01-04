import { XMarkIcon } from "@heroicons/react/24/outline";
import {  useState } from "react";
import { Modal } from "../../component/modal/Modal";
interface Props {
  setOpenModal: (open: boolean) => void;
  addModel: (model: any) => void;
  model?: any;
  setEditProject?: any;
  index?: number | null;
}

export const ModalAddModel = ({ setOpenModal, addModel, model, setEditProject, index }: Props) => {
  const [formData, setFormData] = useState(
    model ?? {
      model: "",
      price: "",
      priceWithDiscount: "",
      area: 0,
    }
  );

  const handleInputChange = (e: any) => {
if (e.target.name === "area" || e.target.name === "price" || e.target.name === "priceWithDiscount") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value === "" ? 0 : parseFloat(e.target.value),
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if(model){
      //find model and update
       setEditProject((prev: any) => ({
        ...prev,
        models: prev.models.map((m: any, i: number) => {
          if (i === index) {
            return formData;
          }
          return m;
        }),
      }));
      return handleCloseModal();
    }
    addModel(formData);
    handleCloseModal();
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  return (
    <Modal>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start items-center ">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Agregar Modelo de Casa
              </h3>
              <button onClick={handleCloseModal}>
                <XMarkIcon className="h-8 w-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Llena los campos para agregar un modelo de casa
              </p>
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-4 text-gray-800 placeholder:text-gray-700 justify-center"
        >
          <div className="flex flex-col gap-4">
            <label htmlFor="name">Nombre del modelo</label>
            <input
              type="text"
              name="model"
              onChange={handleInputChange}
              value={formData.model}
              placeholder="Ingresa el nombre del modelo"
              className="border border-gray-300 px-4 py-2 rounded-md"
              required
            />
            <label htmlFor="description">Area</label>
            <div className="flex gap-2 items-center ">
            <input
              type="number"
              name="area"
              placeholder="Ingresa el area del modelo"
              value={formData.area === 0 ? "" : formData.area}
              onChange={handleInputChange}
              step={0.01}
              className="border border-gray-300 px-4 py-2 rounded-md w-full"
            />
            <span className="">v²</span>
            </div>
            <label htmlFor="minAmount">Precio</label>

            <div className="flex gap-2 w-full items-center">
              <span>L.</span>
              <input
                type="number"
                onChange={handleInputChange}
                value={formData.price}
                step={0.01}
                name="price"
  
                placeholder="Ingresa el precio del modelo "
                className="border border-gray-300 px-4 py-2 rounded-md w-full"
              />
            </div>
            <label htmlFor="minAmount">Precio con descuento</label>
            <div className="flex gap-2 w-full items-center">
              <span>L.</span>
              <input
                type="number"
                onChange={handleInputChange}
                value={formData.priceWithDiscount}
                step={0.01}
                name="priceWithDiscount"
                placeholder="Ingresa el precio con descuento"
                className="border border-gray-300 px-4 py-2 rounded-md w-full"
              />
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Agregar
            </button>
          </div>
        </form>
        <button
          className="w-full bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
          onClick={handleCloseModal}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
};
