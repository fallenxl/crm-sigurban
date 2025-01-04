import { useEffect, useState } from "react";
import { getModelsByProjectID } from "../../../../services/projects.services";
import { formatCurrency } from "../../../../utils";

interface Props {
  lead: any;
  setModelPayload: React.Dispatch<React.SetStateAction<any>>;
}

interface Model {
  model: string;
  area: number;
  price: number;
  priceWithDiscount: number;
}

export const ToAssignModel = ({ lead, setModelPayload }: Props) => {
  const [models, setModels] = useState<Model[]>([]);
  const [modelSelected, setModelSelected] = useState<Model | null>(null);
  useEffect(() => {
    getModelsByProjectID(lead.projectDetails.projectID._id).then((res) => {
      setModels(res?.data.models);
      console.log(res?.data.models);
    });
  }, []);

  const handleSelectedModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((model) => model.model === e.target.value);
    if (model) {
      setModelSelected(model);
      setModelPayload(model);
    }
  };

  return (
    <>
      <label htmlFor="selectAdvisor">Seleccionar un modelo:</label>
      <select
        name="projectName"
        className="border border-gray-300 rounded-md p-2"
        onChange={handleSelectedModel}
        value={modelSelected?.model ?? ""}
      >
        <option value="" defaultChecked disabled>
          Seleccionar modelo
        </option>
        {models.length > 0 &&
          models?.map((model) => {
            return (
              <option key={model.model} value={model.model}>
                {model.model}
              </option>
            );
          })}
      </select>
      {modelSelected && (
        <>
          <h2 className="text-2xl font-bold mt-4 text-gray-700">
            Información del modelo
          </h2>
          <div className="flex flex-col">
            <div className="flex flex-row justify-between">
              <p className="font-bold text-gray-600">Modelo:</p>
              <p className="text-gray-600 font-medium">
                {modelSelected?.model}
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="font-bold text-gray-600">Área:</p>
              <p className="text-gray-600 font-medium">
                {modelSelected?.area + "V²"}
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="font-bold text-gray-600">Precio:</p>
              <p className="text-gray-600 font-medium">
                {formatCurrency(modelSelected?.price)}
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="font-bold text-gray-600">Precio con descuento:</p>
              <p className="text-gray-600 font-medium">
                {formatCurrency(modelSelected?.priceWithDiscount)}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};
