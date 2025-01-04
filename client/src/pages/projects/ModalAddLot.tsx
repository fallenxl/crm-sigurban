import {XMarkIcon} from "@heroicons/react/24/outline";
import {useEffect, useState} from "react";
import {Modal} from "../../component/modal/Modal";
import {getLeadById} from "../../services/lead.services";
import {useSelector} from "react-redux";
import {AppStore} from "../../redux/store.ts";

interface Props {
    setOpenModal: (open: boolean) => void;
    addLot: (lot: any, opt?: string) => void;
    projectID?: string;
    lot?: any;
    setEditProject?: any;
}

export const ModalAddLot = ({
                                setOpenModal,
                                addLot,
                                lot,
                                setEditProject,
                                projectID,
                            }: Props) => {
    const [formData, setFormData] = useState(
        lot ?? {
            projectID,
            block: "",
            lot: "",
            price: "",
            area: 0,
            status: "Disponible",
        }
    );
    const [lead, setLead] = useState<any>({});
    const user = useSelector((state: AppStore) => state.auth.user);
    useEffect(() => {
        if (lot?.reservedBy) {
            getLeadById(lot.reservedBy).then((res) => {
                setLead(res);
            });
        }
    }, [lot]);

    const handleInputChange = (e: any) => {
        if (e.target.name === "area" || e.target.name === "price") {
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
        if (lot) {
            setEditProject((prev: any) => ({
                ...prev,
                models: prev.models.map((m: any) => {
                    if (m._id === lot._id) {
                        return formData;
                    }
                    return m;
                }),
            }));
            addLot(formData, "update");
            return handleCloseModal();
        }
        addLot(formData);

        return handleCloseModal();
    };
    const handleCloseModal = () => {
        setOpenModal(false);
    };
    return (
        <Modal>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[50rem] overflow-auto">
                <div className="sm:flex sm:items-start items-center ">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Agregar Lote
                            </h3>
                            <button onClick={handleCloseModal}>
                                <XMarkIcon className="h-8 w-8 text-gray-500 hover:text-gray-700"/>
                            </button>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Llena los campos para agregar un lote
                            </p>
                        </div>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="mt-4 text-gray-800 placeholder:text-gray-700 justify-center"
                >
                    <div className="flex flex-col gap-4">
                        {lot && (
                            <>
                                {lot.reservedBy && (
                                    <div>
                                        <label htmlFor="description">Reservado por:</label>
                                        <p>{lead?.data?.name}</p>
                                    </div>
                                )}
                                {lot.status && (
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="description">Estado:</label>
                                        {/*<p*/}
                                        {/*  className={`px-2  py-1 rounded-md text-xs ${*/}
                                        {/*    lot.status === "Disponible"*/}
                                        {/*      ? "bg-green-500 text-white"*/}
                                        {/*      : "bg-red-500 text-white"*/}
                                        {/*  }`}*/}
                                        {/*>*/}
                                        {/*  {lot.status}*/}
                                        {/*</p>*/}
                                        <div>
                                            <select
                                                name="status"
                                                onChange={handleInputChange}
                                                value={formData.status}
                                                className="border border-gray-300 px-4 py-2 rounded-md"
                                            >
                                                {/*point green in span*/}
                                                <option value="Disponible">Disponible</option>
                                                <option value="Reservado">Reservado</option>
                                                <option value="Vendido">Liquidado</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <label htmlFor="name">Numero de lote</label>
                        <input
                            type="number"
                            name="lot"
                            onChange={handleInputChange}
                            value={formData.lot}
                            placeholder="Ingresa el nombre del modelo"
                            className="border border-gray-300 px-4 py-2 rounded-md"
                            required
                        />

                        <label htmlFor="description">Bloque</label>
                        <input
                            type="text"
                            name="block"
                            onChange={handleInputChange}
                            value={formData.block}
                            placeholder="Ingresa el bloque"
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
                        {/*svg path*/}
                        {user?.role === 'ADMIN' &&( <>
                        <label htmlFor="description">Path<span> (Ubicacion en el mapa)</span></label>
                            <input
                            type="text"
                            name="svgPath"
                            onChange={handleInputChange}
                        value={formData.svgPath}
                        placeholder="Ingresa el path del modelo"
                        className="border border-gray-300 px-4 py-2 rounded-md"
                    />
                        </>)
                    }
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
