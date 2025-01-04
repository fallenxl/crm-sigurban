import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal } from "../../component/modal/Modal";
import { Input } from "../../component/inputs/input";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Chip } from "@material-tailwind/react";
import {
  getRequirementByName,
  updateRequirementByName,
} from "../../services/requirements.services";
import { successAlert } from "../../component/alerts/Alerts";
import { TextArea } from "../../component/inputs/textarea";
import { TrashIcon } from "@heroicons/react/24/outline";
import { createGoal, deleteGoal, getSettings } from "../../services/settings.services";

interface ModalRequirementsProps {
  stage: string;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  type: 'requirements' | 'goals';
}
export function ModalRequirements({
  stage,
  setOpenModal,
  type,
}: ModalRequirementsProps) {
  const [formData, setFormData] = useState({
    name: stage,
    requirements: [] as string[],
  });

  const [goalsForm, setGoalsForm] = useState({
    name: "",
    description: "",
    target: "",
    startDate: "",
    endDate: "",
  });

  const [goalsHistory, setGoalsHistory] = useState<any[]>([]);
  const [existGoalActive, setExistGoalActive] = useState(false);
  useEffect(() => {
    if (type === 'requirements') {
      getRequirementByName(stage).then((res: any) => {
        if (res.data) {

          setFormData({
            name: res.data[0]?.name ?? stage,
            requirements: res.data[0]?.requirements ?? [],
          });
        }
      });
    } else if (type === 'goals') {
      getSettings().then((res: any) => {
        if (stage.includes('Generales')) {
          setGoalsHistory(res.data.generalGoals);
          res.data.generalGoals.forEach((goal: any) => {
            const today = new Date();
            const startDate = new Date(goal.startDate);
            const endDate = new Date(goal.endDate);
            if (today >= startDate && today <= endDate) {
              setExistGoalActive(true);
            }
          });
        } else {
          setGoalsHistory(res.data.individualGoalsAdvisor);
          res.data.individualGoalsAdvisor.forEach((goal: any) => {
            const today = new Date();
            const startDate = new Date(goal.startDate);
            const endDate = new Date(goal.endDate);
            if (today >= startDate && today <= endDate) {
              setExistGoalActive(true);
            }

          }
          );

        }
      }
      );
    }

  }, []);


  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (type === 'requirements') {
      updateRequirementByName(formData.name, formData.requirements).then(
        (_res) => {
          successAlert("Requisitos actualizados", "Los requisitos se han actualizado correctamente");
          setOpenModal(false);
        }
      );
    } else if (type === 'goals') {
      const type = stage.includes('Generales') ? 'general' : 'advisor';
      createGoal(goalsForm, type).then(() => {
        successAlert("Meta creada", "La meta se ha creado correctamente");
        setOpenModal(false);

      });
    }
  };

  function handleDeleteGoal(id: string) {

    deleteGoal(id, stage.includes('Generales') ? 'general' : 'advisor').then(() => {
      setGoalsHistory(goalsHistory.filter((goal) => goal._id !== id));
      successAlert("Meta eliminada", "La meta se ha eliminado correctamente");
      setOpenModal(false);
    }
    )
  }

  return (
    <Modal>
      {type === 'requirements' && (<>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">{`Requisitos ${stage}`}</h2>
        </div>
        <div className="p-4">
          <Input
            value={formData.name}
            label="Nombre"
            className="mb-4 text-gray-500"
            disabled
          />
          <Input
            placeholder="Escribe el requisito y presiona [Enter] para agregarlo"
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFormData({
                  ...formData,
                  requirements: [...formData.requirements, e.currentTarget.value],
                });
                e.currentTarget.value = "";
              }
            }}
            label="Requisitos"
          />
          <ul className="flex flex-wrap gap-2 mt-3">
            {formData.requirements.map((requirement, index) => (
              <li key={index}>
                <Chip
                  color="blue"
                  value={requirement}
                  icon={
                    <XMarkIcon
                      onClick={() =>
                        setFormData({
                          ...formData,
                          requirements: formData.requirements.filter(
                            (p) => p !== requirement
                          ),
                        })
                      }
                      className="h-5 w-5 text-white hover:text-gray-200 cursor-pointer"
                    />
                  }
                />
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={() => setOpenModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Guardar
            </button>
          </div>
        </div>
      </>)}

      {type === 'goals' && (<>
        <div className="p-4 ">
          <h2 className="text-xl font-bold text-gray-800">{`Objetivo de Prospectos - ${stage}`}</h2>
        </div>
        {existGoalActive && (
          <div className="p-4">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">¡Atención!</p>
              <p>Ya existe una meta activa para este periodo</p>
            </div>
          </div>
        )}
        <div className="p-4 flex flex-col">
          <form onSubmit={handleSubmit}>
            <Input
              value={goalsForm.name}
              label="Nombre"
              name="name"
              placeholder="Escribe el nombre de la meta"
              onChange={(e) => setGoalsForm({ ...goalsForm, name: e.target.value })}
              disabled={existGoalActive}
              required

            />
            <TextArea
              value={goalsForm.description}
              label="Descripción"
              name="description"
              placeholder="Escribe la descripción de la meta"
              onChange={(e) => setGoalsForm({ ...goalsForm, description: e.target.value })}
              disabled={existGoalActive}
            />
            <Input
              value={goalsForm.target}
              label="Objetivo"
              name="target"
              type="number"
              min={1}
              placeholder="Escribe el objetivo de la meta"
              onChange={(e) => setGoalsForm({ ...goalsForm, target: e.target.value })}
              disabled={existGoalActive}
              required
            />

            <Input
              value={goalsForm.startDate}
              label="Fecha de inicio"
              name="startDate"
              type="date"
              onChange={(e) => setGoalsForm({ ...goalsForm, startDate: e.target.value })}
              disabled={existGoalActive}
              required

            />
            

            <Input
              value={goalsForm.endDate}
              label="Fecha de fin"
              name="endDate"
              type="date"
              onChange={(e) => setGoalsForm({ ...goalsForm, endDate: e.target.value })}
              disabled={existGoalActive}
              required
            min={goalsForm.startDate? goalsForm.startDate : undefined}
            />

            <div className="overflow-auto max-h-[16.1rem] mt-5">
              <table className="table-auto w-full h-10 overflow-auto ">
                <thead className="sticky top-0 bg-gray-100 z-10 ">
                  <tr className="bg-gray-100 mt-10 text-gray-600 text-sm">
                    <th>Nombre</th>
                    <th>Objetivo</th>
                    <th>Fecha de inicio</th>
                    <th>Fecha de fin</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {goalsHistory.map((item) => {
                    return (
                      <tr className="border-b py-2 text-sm relative">
                        {/* line in the middle row, full width if the endDate is minor than today */}

                        <td className="p-2">
                          {item.name}</td>
                        <td className="p-2" >234/{item.target}</td>
                        <td className="p-2">{new Date(item.startDate).toLocaleDateString()}</td>
                        <td className="p-2">{new Date(item.endDate).toLocaleDateString()}</td>
                        <td className={`p-2 ${existGoalActive ? "text-green-500" : "text-red-500"}`}>
                          {existGoalActive ? "Activo" : "Expirado"}
                        </td>
                        <td className="">
                          <TrashIcon
                            onClick={() => handleDeleteGoal(item._id)}
                            className="ml-5 h-5 w-5 text-red-500 cursor-pointer" />
                        </td>
                      </tr>
                    )
                  })}
                  {
                    goalsHistory.length === 0 && (
                      <tr className="text-sm relative text-gray-500">
                        <td colSpan={6} className="text-center pt-10">No hay metas registradas</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
           

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                
                className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                disabled={existGoalActive}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </>)}
    </Modal>
  );
}
