import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../../component/modal/Modal";
import { FinancialProgram } from "../../../interfaces";
import { useEffect, useState } from "react";

interface Props {
  addFinancialProgram: (program: FinancialProgram) => void;
  setOpenModal: (open: boolean) => void;
  updateProgram?: FinancialProgram | null;
  handleUpdateProgram?: (program: FinancialProgram) => void;
  setUpdateProgram?: (program: FinancialProgram | null) => void;
}

export const ModalFinancialProgram = ({
  addFinancialProgram,
  setOpenModal,
  updateProgram,
  handleUpdateProgram,
  setUpdateProgram,
}: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    interestRate: 0,
  } as FinancialProgram);

  useEffect(() => {
    if (!updateProgram) return;
    setFormData({
      name: updateProgram.name,
      description: updateProgram.description,
      interestRate: updateProgram.interestRate,
    });
  }, [updateProgram]);

  const handleCloseModal = () => {
    setFormData({
      name: "",
      description: "",
      interestRate: 0,
    });
    setUpdateProgram && setUpdateProgram(null);
    setOpenModal(false);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (
      formData.name === "" ||
      formData.description === "" ||
      formData.interestRate === 0
    )
      return alert("Llena todos los campos");
    if (updateProgram) {
      handleUpdateProgram && handleUpdateProgram(formData);
    } else {
      addFinancialProgram(formData);
    }
    handleCloseModal();
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <Modal>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start items-center ">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Agregar programa de financiamiento
              </h3>
              <button onClick={handleCloseModal}>
                <XMarkIcon className="h-8 w-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Llena los campos para agregar un programa de financiamiento
              </p>
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-4 text-gray-800 placeholder:text-gray-700 justify-center"
        >
          <div className="flex flex-col gap-4">
            <label htmlFor="name">Nombre del programa</label>
            <input
              type="text"
              name="name"
              onChange={handleInputChange}
              value={formData.name}
              placeholder="Programa de financiamiento"
              className="border border-gray-300 px-4 py-2 rounded-md"
            />
            <label htmlFor="description">Descripción</label>
            <textarea
              name="description"
              placeholder="Descripción"
              value={formData.description}
              onChange={handleInputChange}
              className="border border-gray-300 px-4 py-2 rounded-md resize-none"
            />
            <label htmlFor="minAmount">Tasa de interés</label>
            <small className="text-gray-500">
              Agrega un porcentaje de interés entre 0 y 100
            </small>
            <input
              type="number"
              onChange={handleInputChange}
              value={formData.interestRate === 0 ? "" : formData.interestRate}
              step={0.01}
              min={0}
              max={100}
              name="interestRate"
              placeholder="Tasa de interés"
              prefix="%"
              className="border border-gray-300 px-4 py-2 rounded-md"
            />
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
