import { useEffect, useState } from "react";
import { Layout } from "../Layout";
import { getAllCampaignsByStatus } from "../../services/campaign";
import {
    getAdvisorsIncludingManagers,
    getLastAdvisor,
    getSettingsAutoAssign,
} from "../../services/user.services";
import { createLead } from "../../services/lead.services";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";
import {
    errorAlertWithTimer,
    successAlertWithRedirect,
} from "../../component/alerts/Alerts";
import { Loading } from "../../component";
import { capitalizeFirstLetterByWord, clearDNIMask } from "../../utils";
import {
    channels,
    DNI_MAX_LENGTH,
    PASSPORT_MAX_LENGTH,
    PASSPORT_MIN_LENGTH,
    RESIDENCE_NUMBER_MAX_LENGTH
} from "../../constants/general";
import { Input } from "../../component/inputs/input.tsx";
import { CreateLeadDTO } from "../../interfaces";
import { TextArea } from "../../component/inputs/textarea.tsx";
import countriesData from "../../assets/paises.json"
interface Campaign {
    _id: string;
    name: string;
}

interface Advisor {
    _id: string;
    name: string;
}

export const CreateLead = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [campaignSelected, setCampaignSelected] = useState<string>("");
    const handleCampaignSelected = (e: any) => {
        setCampaignSelected(e.target.value);
    };
    const [advisorSelected, setAdvisorSelected] = useState<string>("");
    const handleAdvisorSelected = (e: any) => {
        setAdvisorSelected(e.target.value);
    };
    const [others, setOthers] = useState({
        otherCountry: "",
        otherDepartment: "",
    })
    const handleOthers = (e: any) => {
        setOthers({
            ...others,
            [e.target.name]: e.target.value
        })
    }
    const [formData, setFormData] = useState<CreateLeadDTO>({
        name: "",
        dni: "",
        birthdate: "",
        genre: "",
        passport: "",
        residenceNumber: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        department: "",
        municipality: "",
        source: "Facebook Naranja",
        interestedIn: "",
        workAddress: "",
        workPosition: "",
        salary: "",
        workTime: "",
        paymentMethod: "",
        comment: "",

    });

    const handleInputChange = (e: any) => {

        if (e.target.name === "country") {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
                department: ""
            });
            return;
        }
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.name === "salary"
                    ? e.target.value.toString()
                    : e.target.name === "dni"
                        ? clearDNIMask(e.target.value)
                        : e.target.name !== "email" &&
                            e.target.name !== "comment" &&
                            e.target.name !== "address" &&
                            e.target.name !== "interestedIn"
                            ? capitalizeFirstLetterByWord(e.target.value)
                            : e.target.value,
        });
    };
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        const data = {
            ...formData,
            name: capitalizeFirstLetterByWord(formData.name),
            dni: clearDNIMask(formData.dni),
            campaignID: campaignSelected ?? null,
            department: formData.country === "Otro" ? others.otherDepartment : formData.department,
            country: formData.country === "Otro" ? others.otherCountry : formData.country,
            advisorID:
                user.role === "ADVISOR" ? user.id : advisorSelected || undefined,
        };
        createLead(data).then((res) => {
            setIsLoading(false);
            if (typeof res === "string" || !res) {
                return errorAlertWithTimer("Error", res ?? 'Error al crear el prospecto');
            }
            successAlertWithRedirect(
                "Lead creado",
                "El lead se ha creado correctamente",
                "/prospectos/lista"
            );
        });
    };

    const [autoAssign, setAutoAssign] = useState<boolean>(false);
    useEffect(() => {
        getAllCampaignsByStatus().then((res) => {
            setCampaigns(res?.data);
        });

        getAdvisorsIncludingManagers().then((res) => {
            setAdvisors(res);
        });

        getSettingsAutoAssign(user.id).then((res) => {
            setAutoAssign(res);
        });
    }, []);

    const [lastAdvisor, setLastAdvisor] = useState<string>("");
    useEffect(() => {
        if (autoAssign) {
            getLastAdvisor().then((res) => {
                setAdvisorSelected(res?.data._id);
                setLastAdvisor(res?.data.name);
            });
        } else {
            setLastAdvisor("");
            setAdvisorSelected("");
        }
    }, [autoAssign]);

    const [department, setDepartment] = useState<string[]>([]);
    const [municipalities, setMunicipalities] = useState<string[]>([]);
    useEffect(() => {
        if (formData.country) {
            setDepartment(
                countriesData.countries
                    .find((country) => country.name === formData.country)
                    ?.states ?? []
            );
        }

        if(formData.country === 'Honduras' && formData.department){
            setMunicipalities(
                countriesData.countries[0].departments?.find((department) => department.name === formData.department)?.municipalities ?? []
            )
        }

    }, [formData.country, formData.department]);
    const { user } = useSelector((state: AppStore) => state.auth);

    const [useDNI, setUseDNI] = useState<boolean>(true);
    const [usePassport, setUsePassport] = useState<boolean>(false);
    const [useResidenceNumber, setUseResidenceNumber] = useState<boolean>(false);
    const handlePassportAndResidenceNumber = (e: any) => {
        if (e.target.id === 'passport') {
            setUsePassport(!usePassport);
            setUseResidenceNumber(false);
            setUseDNI(false)
        } else if (e.target.id === 'residenceNumber') {
            setUseResidenceNumber(!useResidenceNumber);
            setUsePassport(false);
            setUseDNI(false)
        } else if (e.target.id === 'dni') {
            if (e.target.checked) {
                setUseDNI(true);
            }

            setUsePassport(false);
            setUseResidenceNumber(false);
        }

        setFormData({
            ...formData,
            passport: '',
            residenceNumber: '',
            dni: ''
        })

    }
    return (
        <>
            <Layout title="Crear prospecto">
                {isLoading && <Loading className="bg-[rgba(255,255,255,0.1)] z-10" />}
                <div className="w-full lg:w-3/4 bg-white h-auto px-10 py-6 rounded-md">
                    <form
                        onSubmit={handleSubmit}
                        action=""
                        className="text-sm flex flex-col gap-4"
                    >
                        <div className="flex flex-col xl:flex-row items-center justify-between mb-4 gap-4">
                            <div>
                                <h1 className="text-xl text-gray-700">
                                    Registrar un nuevo prospecto
                                </h1>
                                <small className="text-gray-500 mb-6">
                                    Llena de forma correcta los campos del prospecto
                                </small>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    {!autoAssign &&
                                        user.role !== "ADVISOR" &&
                                        user.role !== "COMMUNITY_MANAGER" && (
                                            <div className="flex flex-col">
                                                <small className="text-gray-600">
                                                    <strong className="text-red-500 text-sm">*</strong>
                                                    Asigna un asesor:
                                                </small>
                                                <select
                                                    placeholder="Seleccione un asesor"
                                                    className="border p-2 text-gray-700 rounded-md border-blue-gray-300"
                                                    onChange={handleAdvisorSelected}
                                                    value={advisorSelected}
                                                    required
                                                >
                                                    <option value="" defaultChecked>
                                                        Sin asignar
                                                    </option>

                                                    {advisors.length > 0 &&
                                                        advisors.map((advisor) => {
                                                            return (
                                                                <option
                                                                    value={advisor._id}
                                                                    key={advisor._id}
                                                                    className="mb-1 p-4"
                                                                >
                                                                    {advisor.name}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                        )}

                                    <div className="flex flex-col">
                                        <small className="text-gray-600">
                                            {user.role === "COMMUNITY_MANAGER" &&
                                                <strong className="text-red-500 text-sm">*</strong>}
                                            Selecciona una campaña:
                                        </small>
                                        <select
                                            placeholder="Seleccione un asesor"
                                            className="border p-2 text-gray-700 rounded-md border-blue-gray-300"
                                            onChange={handleCampaignSelected}
                                            value={campaignSelected}
                                            required={user.role === "COMMUNITY_MANAGER"}
                                        >
                                            <option value="" defaultChecked>
                                                Sin asignar
                                            </option>

                                            {campaigns.map((campaign) => {
                                                return (
                                                    <option
                                                        value={campaign._id}
                                                        key={campaign._id}
                                                        className="mb-1"
                                                    >
                                                        {campaign.name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                                {user.role !== "ADVISOR" && (
                                    <div className="flex flex-col justify-center items-center">
                                        {autoAssign && (
                                            <div className="flex flex-col items-center">
                                                <small className="text-gray-600">
                                                    Configuración automática{" "}
                                                    <span className="font-bold">activada</span>
                                                </small>
                                                <div className="flex items-center gap-2">
                                                    <small className="text-gray-600">
                                                        Asesor asignado:
                                                    </small>
                                                    <span className="text-blue-500 text-sm">
                                                        {lastAdvisor}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Input
                            name="name"
                            value={capitalizeFirstLetterByWord(formData.name)}
                            onChange={handleInputChange}
                            type="text"
                            label="Nombre Completo"
                            required
                        />
                        <div className={'flex items-center'}>
                            <Input
                                name={`${usePassport ? "passport" : useResidenceNumber ? "residenceNumber" : "dni"}`}
                                value={`${usePassport ? formData.passport : useResidenceNumber ? formData.residenceNumber : formData.dni}`}
                                onChange={handleInputChange}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text/plain");
                                    const numbers = text.replace(/\D/g, "");

                                    // Aquí actualizamos el estado del formulario para reflejar el nuevo valor pegado
                                    const fieldName = usePassport ? "passport" : useResidenceNumber ? "residenceNumber" : "dni";
                                    handleInputChange({
                                        target: {
                                            name: fieldName,
                                            value: numbers
                                        }
                                    });
                                }}
                                maxLength={usePassport ? PASSPORT_MAX_LENGTH : useResidenceNumber ? RESIDENCE_NUMBER_MAX_LENGTH : DNI_MAX_LENGTH}
                                minLength={usePassport ? PASSPORT_MIN_LENGTH : useResidenceNumber ? RESIDENCE_NUMBER_MAX_LENGTH : DNI_MAX_LENGTH}
                                type="text"
                                label={`${usePassport ? "Pasaporte" : useResidenceNumber ? "Numero de residencia" : "DNI"}`}
                                required={user.role !== "COMMUNITY_MANAGER"}
                            />
                        </div>
                        <div className={'flex items-center gap-4'}>
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="dni"
                                    name="dni"
                                    checked={useDNI}
                                    onChange={handlePassportAndResidenceNumber}
                                />
                                <label htmlFor="residenceNumber" className="text-gray-700">
                                    DNI
                                </label>
                            </div>
                            {/*input checkbox if is passport*/}
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="passport"
                                    name="passport"
                                    checked={usePassport}
                                    onChange={handlePassportAndResidenceNumber}
                                />
                                <label htmlFor="passport" className="text-gray-700">
                                    Pasaporte
                                </label>
                            </div>
                            {/*Input checkbox if is residence number*/}
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="residenceNumber"
                                    name="residenceNumber"
                                    checked={useResidenceNumber}
                                    onChange={handlePassportAndResidenceNumber}
                                />
                                <label htmlFor="residenceNumber" className="text-gray-700">
                                    Numero de residencia
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col  gap-4 md:gap-2 md:flex-row items-center">

                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}

                                type="tel"
                                label="Numero de teléfono"
                                required
                            />
                            <Input
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                type="date"
                                label="Fecha de nacimiento"
                            />

                            <div className="flex flex-col w-full">
                                <label htmlFor="genre" className="text-gray-700">
                                    Género
                                </label>
                                <select
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleInputChange}
                                    className="border p-2 text-gray-700 rounded-md border-blue-gray-300"
                                >
                                    <option value="" defaultChecked>
                                        Seleccione un género
                                    </option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col  gap-4 md:gap-2 md:flex-row items-center">

                            <div className="flex flex-col flex-grow gap-2 w-full">
                                <label htmlFor="country" className="text-gray-700">
                                    País
                                </label>
                                <select name="country" value={formData.country} onChange={handleInputChange} className="border p-2 text-gray-700 rounded-md border-blue-gray-300 flex-grow">
                                    <option value="" defaultChecked>
                                        Seleccione un país
                                    </option>

                                    {countriesData.countries.map((country) => {
                                        return (
                                            <option value={country.name} key={country.name}>
                                                {country.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {formData.country === "Otro" && (
                                    <div className="flex  gap-2 w-full ">
                                        <Input
                                            name="otherCountry"
                                            value={others.otherCountry}
                                            onChange={handleOthers}
                                            type="text"
                                            label="Especifique el país"
                                            required
                                        />
                                        <Input
                                            name="otherDepartment"
                                            value={others.otherDepartment}
                                            onChange={handleOthers}
                                            type="text"
                                            label="Especifique el departamento"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            {(formData.country && department.length > 0) && (

                                <>
                                    <div className="flex flex-col gap-2 flex-grow w-full">
                                        <label htmlFor="department" className="text-gray-700">
                                            {
                                                formData.country === "Honduras" ? "Departamento" : formData.country === "USA" ? "Estado" : "Provincia"
                                            }
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="border p-2 text-gray-700 rounded-md border-blue-gray-300 flex-grow"
                                        >
                                            <option value="" defaultChecked>
                                                Seleccione un departamento
                                            </option>
                                            {department.map((department) => {
                                                return (
                                                    <option value={department} key={department}>
                                                        {department}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    {(formData.country === "Honduras" && formData.department) && (
                                        <div className="flex flex-col gap-2 flex-grow w-full">
                                            <label htmlFor="department" className="text-gray-700">
                                                Municipio
                                            </label>
                                            <select
                                                name="municipality"
                                                value={formData.municipality}
                                                onChange={handleInputChange}
                                                className="border p-2 text-gray-700 rounded-md border-blue-gray-300 flex-grow"
                                            >
                                                <option value="" defaultChecked>
                                                    Seleccione un municipio
                                                </option>
                                                {municipalities.map((municipality) => {
                                                    return (
                                                        <option value={municipality} key={municipality}>
                                                            {municipality}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}
                                </>

                            )}
                        </div>
                        <TextArea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            label="Dirección"
                        />

                        <Input
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            type="email"
                            label="Correo electrónico"
                        />
                        <div className="flex flex-col">
                            <label htmlFor="source" className="text-gray-700 mb-2">
                                Canal:
                            </label>
                            <select
                                name="source"
                                value={formData.source}
                                onChange={handleInputChange}
                                className="border p-2 text-gray-700 rounded-md border-blue-gray-300"
                                placeholder="Seleccione una fuente"
                            >
                                {channels.map((channel) => {
                                    return (
                                        <option value={channel} key={channel}>
                                            {channel}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <TextArea
                            name="interestedIn"
                            onChange={handleInputChange}
                            label="Interesado en"
                            value={formData.interestedIn}
                            required
                        />
                        <TextArea
                            name="comment"
                            value={formData.comment}
                            onChange={handleInputChange}
                            label="Comentarios"
                        />
                        <span className="text-gray-500 text-sm">Detalles laborales:</span>
                        <div className="flex flex-col md:flex-row gap-4">
                            <Input
                                name="workAddress"
                                value={formData.workAddress}
                                onChange={handleInputChange}

                                type="text"
                                label="Lugar de trabajo"
                            />
                            <Input
                                name="workPosition"
                                value={formData.workPosition}
                                onChange={handleInputChange}

                                type="text"
                                label="Cargo"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <Input
                                name="salary"
                                value={formData.salary}
                                onChange={handleInputChange}

                                min={0}
                                type="number"
                                label="Salario"
                                step={0.01}
                            />
                            <Input
                                name="workTime"
                                value={formData.workTime}
                                onChange={handleInputChange}

                                type="text"
                                label="Antigüedad"
                            />
                        </div>
                        <span className="text-gray-500 text-sm">Detalles de pago:</span>
                        <div className="flex flex-col md:flex-row gap-4">
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                className="border p-2 text-gray-700 rounded-md border-blue-gray-300"
                            >
                                <option value="" defaultChecked>
                                    Seleccione un método de pago
                                </option>
                                <option value="Efectivo">Pago en Efectivo</option>
                                <option value="Transferencia Bancaria">
                                    Transferencia Bancaria
                                </option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </>
    );
};
