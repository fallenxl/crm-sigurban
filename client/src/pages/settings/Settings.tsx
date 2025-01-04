import { Switch } from "@material-tailwind/react";
import { Layout } from "../Layout";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";
import { ChangeEvent, useEffect, useState } from "react";
import {
    getUserSettings, updateUserSettings,
} from "../../services/user.services";
import { ModalRequirements } from "./ModalRequirements";
import { getSettings, updateSettings } from "../../services/settings.services.ts";
import { ISettings } from "../../interfaces/settings.interfaces.ts";
import { Input } from "../../component/inputs/input.tsx";
import { useDebounce } from "../../hooks/useDebounce.tsx";

export interface IGoal {
    _id: string;
    name: string;
    description: string;
    target: number;
    achieved: number;
    startDate: string;
    endDate: string;
}

export const Settings = () => {
    const user = useSelector((state: AppStore) => state.auth.user);
    const [settings, setSettings] = useState<ISettings>({
        autoAssign: false,
        notificationsSound: false,

    });
    useEffect(() => {
        getUserSettings(user.id).then((res) => {
            setSettings({
                ...settings,
                autoAssign: res.autoAssign ?? false,
                notificationsSound: res.notificationsSound ?? false,
            });
        });
        if (user.role === "ADMIN" || user.role === "MANAGER") {
            getSettings().then((res) => {
                setSettings(prev => {

                    return {
                        ...prev,
                        ...res?.data,
                    };
                });

                console.log(res?.data);
                console.log(settings);
            });
        }
    }, []);

    const debounceSettings = useDebounce((updatedSettings) => {
        updateSettings(updatedSettings).then((res: any) => {
            console.log(res?.data);
        });

    }, 1000)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {

        if (e.target.name === "autoAssign" || e.target.name === "notificationsSound") {
            setSettings({
                ...settings,
                [e.target.name]: e.target.checked,
            });
            updateUserSettings(user.id, {
                ...settings,
                [e.target.name]: e.target.checked,
            }).then((_res) => {
            });

        } else if (e.target.name === "bureauPrequalificationDays" || e.target.name === "bankPrequalificationDays") {
            const trimmed = e.target.value.replace(/^0+/, '') || '0';
            const value = parseInt(trimmed, 10);
            setSettings({
                ...settings,
                [e.target.name]: value > 0 ? trimmed : '0',
            });
            debounceSettings({
                [e.target.name]: value > 0 ? trimmed : '0',
            })

        } else {


            setSettings({
                ...settings,
                [e.target.name]: e.target.value,
            });
            updateUserSettings(user.id, {
                ...settings,
                [e.target.name]: e.target.value,
            }).then((_res) => {

            });

        }
    };

    const [openModal, setOpenModal] = useState(false);
    const [requirementSelected, setRequirementSelected] = useState("");
    const [type, setType] = useState<'requirements' | 'goals'>('requirements');
    function handleOpenModal(type: 'requirements' | 'goals' = 'requirements', requirement: string) {
        setType(type);

        setRequirementSelected(requirement);
        console.log(settings);
        setOpenModal(!openModal);
    }

    return (
        <Layout title="Configuraciones">
            <div className="w-full md:w-3/4 flex flex-col gap-10  mb-10">
                <div className="w-full border-b-2 border-gray-300 py-4">
                    <h2 className="text-2xl font-bold text-gray-800 ">
                        Configuración General
                    </h2>
                </div>
                <div className="flex  justify-between h-4">
                    <label className=" text-gray-800 w-3/4">
                        Asignar prospectos a un asesor de forma automática
                    </label>
                    <Switch
                        crossOrigin={undefined}
                        name={"autoAssign"}
                        color="blue"
                        checked={settings.autoAssign}
                        className="h-full w-full"
                        onChange={handleChange}
                    />
                </div>
                <div className="flex  justify-between h-4">
                    <label className=" text-gray-800 w-3/4">
                        Activar sonido de notificaciones
                    </label>
                    <Switch
                        crossOrigin={undefined}
                        name={"notificationsSound"}
                        color="blue"
                        checked={settings.notificationsSound}
                        className="h-full w-full"
                        onChange={handleChange}
                    />
                </div>
                {(user.role === "ADMIN" || user.role === "MANAGER") && (
                    <div className="mt-10 flex flex-col gap-6">
                        <div className="w-full border-b-2 border-gray-300 py-4">
                            <h2 className="text-2xl font-bold text-gray-800 ">
                                Configuración de Plazos
                            </h2>
                        </div>
                        <div className="flex justify-between h-4">
                            <label className=" text-gray-800 w-full">
                                Días de precalificación de Buró
                            </label>
                            <Input

                                type="number"
                                name="bureauPrequalificationDays"
                                value={settings.bureauPrequalificationDays}
                                onChange={handleChange}
                                min={0}
                            />
                        </div>
                        <div className="w-full flex justify-between h-4 mt-4">
                            <label className=" text-gray-800 w-full">
                                Días de precalificación de Banco
                            </label>
                            <Input
                                type="number"
                                name="bankPrequalificationDays"
                                value={settings.bankPrequalificationDays}

                                onChange={handleChange}
                                min={0}
                            />
                        </div>
                    </div>

                )}


                {user.role === "ADMIN" && (
                    <div className="mt-10 flex flex-col gap-6">
                        <div className="w-full border-b-2 border-gray-300 py-4">
                            <h2 className="text-2xl font-bold text-gray-800 ">
                                Configuración de Requisitos
                            </h2>
                        </div>
                        <div className="flex justify-between h-4">
                            <label className=" text-gray-800">
                                Requisitos primera etapa{" "}
                            </label>
                            <button
                                onClick={() => handleOpenModal('requirements', "Primera Etapa")}
                                className="text-blue-500"
                            >
                                Editar
                            </button>
                        </div>
                        <div className="flex justify-between h-4 mt-4">
                            <label className=" text-gray-800">
                                Requisitos segunda etapa{" "}
                            </label>
                            <button
                                onClick={() => handleOpenModal('requirements', "Segunda Etapa")}
                                className="text-blue-500"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                )}
                {(user.role === "ADMIN" || user.role === "MANAGER") && (
                    <div className="mt-10 flex flex-col gap-6">
                        <div className="w-full border-b-2 border-gray-300 py-4">
                            <h2 className="text-2xl font-bold text-gray-800 ">
                                Configuración de Objetivos
                            </h2>
                        </div>
                        <div className="flex justify-between h-4">
                            <label className=" text-gray-800">
                                Objetivo de prospectos{" "} general
                            </label>
                            <button
                                onClick={() => handleOpenModal("goals", "Generales")}
                                className="text-blue-500"
                            >
                                Editar
                            </button>
                        </div>
                        <div className="flex justify-between h-4 mt-4">
                            <label className=" text-gray-800">
                                Objetivo de prospectos{" "} por asesor
                            </label>
                            <button
                                onClick={() => handleOpenModal("goals", "Por Asesor")}
                                className="text-blue-500"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {openModal && (
                <ModalRequirements
                    stage={requirementSelected}
                    setOpenModal={setOpenModal}
                    type={type}
                 

                />
            )}
        </Layout>
    );
};
