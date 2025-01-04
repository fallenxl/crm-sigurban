import { useEffect, useState } from "react";
import { Layout } from "../Layout";
import { exportDataService, getDashboardService } from "../../services/dashboard.services";
import ReactECharts from "echarts-for-react";
import { ChevronDownIcon, PhoneArrowDownLeftIcon, TrophyIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";
import { getStatusColor } from "../../utils/charts";

const tabs = [
  { label: "Por Canal", key: "channel" },
  { label: "Por País", key: "country" },
  { label: "Por Departamento/Estado", key: "city" },
  { label: "Por Municipio", key: "municipality" },
  { label: "Por Banco", key: "banks" },
];

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [option, setOption] = useState<any>(null);
  const [ageOption, setAgeOption] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("channel");
  const [interval, setInterval] = useState<any>({
    startDate: '',
    endDate: ''
  });

  const handleInterval = (e: any) => {
    setInterval({
      ...interval,
      [e.target.name]: e.target.value
    });
  }
  const user = useSelector((state: AppStore) => state.auth.user);

  useEffect(() => {
    getDashboardService(interval).then((response: any) => {
      setDashboardData(response?.data);
      let dataX = response?.data?.leadsByStatus;
      if (response?.data?.leadsStatusByDate) {
        dataX = response?.data?.leadsStatusByDate;
      }

      setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          data: ["Prospectos"],
        },
        yAxis: {},
        series: dataX.map((item: any) => {
          return {
            name: item.status ?? item._id,
            type: "bar",
            data: [item.count],
            color: getStatusColor(item.status ?? item._id),
          };
        }),
      });

      // Transformar fechas de nacimiento a edades y preparar los datos para el gráfico
      const ageData = response?.data?.leadsByAge?.map((item: any) => {
        const birthYear = new Date(item._id).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        let ageGroup = "";
        if (age >= 18 && age <= 24) {
          ageGroup = "18-24";
        } else if (age >= 25 && age <= 34) {
          ageGroup = "25-34";
        } else if (age >= 35 && age <= 44) {
          ageGroup = "35-44";
        } else if (age >= 45 && age <= 54) {
          ageGroup = "45-54";
        } else if (age >= 55 && age <= 64) {
          ageGroup = "55-64";
        } else if (age >= 65) {
          ageGroup = "65+";
        }

        return { ...item, age, ageGroup };
      });

      const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
      const ageCounts = ageGroups.map((group) =>
        ageData.filter((item: any) => item.ageGroup === group).length
      );

      setAgeOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: ageGroups
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: ageCounts,
          type: 'bar',

          itemStyle: {
            color: function (params: any) {
              const colorList = [
                '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83'
              ];
              return colorList[params.dataIndex];
            }
          }
        }],

      });
    });
  }, [interval.startDate, interval.endDate]);

  const renderTableData = () => {
    let data = [];
    switch (activeTab) {
      case "channel":
        data = dashboardData?.leadsByChannel || [];
        break;
      case "country":
        data = dashboardData?.leadsByCountry || [];
        break;
      case "city":
        data = dashboardData?.leadsByCity || [];
        break;
      case "municipality":
        data = dashboardData?.leadsByMunicipality || [];
        break;
      case "banks":
        data = dashboardData?.leadsByBanks || [];
        break;
      default:
        break;
    }
    return data;
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "channel":
        return (
          <>
            <th>Canal</th>
            <th>Prospectos</th>
          </>
        );
      case "country":
        return (
          <>
            <th>País</th>
            <th>Prospectos</th>
          </>
        );
      case "city":
        return (
          <>
            <th>Ciudad</th>
            <th>Prospectos</th>
          </>
        );
      case "municipality":
        return (
          <>
            <th>Municipio</th>
            <th>Prospectos</th>
          </>
        );
      case "banks":
        return (
          <>
            <th>Banco</th>
            <th>Prospectos</th>
          </>
        );
      default:
        break;
    }
  };

  const renderAdvisorTable = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md col-span-4 md:col-span-4 lg:col-span-2">
        <h2 className="text-xl font-semibold">Prospectos por Asesor</h2>
        <small className="text-gray-500">Cantidad de prospectos por asesor</small>
        <div className="overflow-auto mt-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="text-left bg-gray-100">
                <th>Asesor</th>
                <th>Prospectos</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.leadsByAdvisor?.sort(
                (a: any, b: any) => b.count - a.count
              ).map((item: any, index: number) => (
                <tr key={index} className={`border border-gray-300 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                  <td className="p-2">{item.advisor}</td>
                  <td className="p-2">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  function handleExportData(format: string) {
    exportDataService(format).then((response: any) => {
      console.log(response);
    });
  }
  const options = [
    { value: "pdf", label: "Exportar en PDF" },
    { value: "excel", label: "Exportar en Excel" },
    { value: "csv", label: "Exportar en CSV" },

  ]
  return (
    <Layout title="Dashboard">
      {/* <div className="flex items-center justify-end gap-4 mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={()=> handleExportData('pdf')}
        >Exportar en PDF</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={()=> handleExportData('excel')}
        >Exportar en Excel</button>
      </div> */}
      {/* Dropdown */}
    <div className="flex items-center justify-end gap-4 mb-4">
        <div className="relative inline-flex items-center cursor-pointer">
          <ChevronDownIcon className="h-5 w-5 absolute right-0 mr-2" />
          <select
          value={""}
            className="border border-gray-300 rounded-md text-gray-600 h-10 pl-5 pr-10 bg-white hover:border-gray-400 focus:outline-none appearance-none cursor-pointer"
            onChange={(e) => handleExportData(e.target.value)}
          >
            <option value="" className="cursor-pointer" disabled >Exportar</option>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-gray-800 w-full ">
        <div className=" items-center gap-4 w-full  col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <div className="bg-white p-4 rounded-lg shadow-md  flex-grow col-span-1 w-full h-full">
            <h2 className="text-xl font-semibold pb-5 flex items-center justify-between">
              Total Prospectos
              <UsersIcon className="h-6 w-6" />
            </h2>
            <p className="text-3xl font-semibold">{dashboardData?.totalLeads}</p>
            <small className="text-gray-500">Desde el inicio</small>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md  flex-grow col-span-1 w-full h-full">
            <h2 className="text-xl font-semibold pb-5 flex justify-between">
              Total pendientes de llamar
              <PhoneArrowDownLeftIcon className="h-6 w-6" />
            </h2>
            <p className="text-3xl font-semibold">
              {dashboardData?.leadsPendingCall}
            </p>
            <small className="text-gray-500">Desde el inicio</small>
          </div>
          {dashboardData?.currentGoals.generalGoals &&
            <div className="bg-white p-4 rounded-lg shadow-md   flex-grow col-span-1 w-full h-full">
            <h2 className="text-xl font-semibold pb-5 flex justify-between">
              Objetivos generales
              <TrophyIcon className="h-6 w-6" />
            </h2>
            <p className={`text-2xl font-semibold flex items-center gap-3`}>
              
              {dashboardData?.currentGoals.generalGoals?.name ?? <span className="text-sm font-medium text-gray-500">No hay objetivos</span>}
              {/* completed if the status is equal or more */}
              {dashboardData?.currentGoals.generalGoalsStatus === dashboardData?.currentGoals.generalGoals?.target && <span className="text-green-500 text-sm">
                Completado</span >}
            </p>

            {dashboardData?.currentGoals.generalGoals && (
              <>
                <p className="text-sm font-semibold text-gray-500">Progreso:
                  
                  {dashboardData?.currentGoals.generalGoalsStatus}
                  /{dashboardData?.currentGoals.generalGoals.target}</p>

                <small className="text-gray-500 text-xs">
                  Del {new Date(dashboardData?.currentGoals.generalGoals.startDate).toLocaleDateString()} a {new Date(dashboardData?.currentGoals.generalGoals.endDate).toLocaleDateString()}

                </small>
              </>
            )}
          </div>}
        {dashboardData?.currentGoals.individualGoals && 
         <div className="bg-white p-4 rounded-lg shadow-md   flex-grow col-span-1 w-full h-full">
            <h2 className="text-xl font-semibold pb-5 flex justify-between">
              Objetivos Individuales
              <TrophyIcon className="h-6 w-6" />
            </h2>
            <p className="text-2xl font-semibold">
              {dashboardData?.currentGoals.individualGoals?.name ?? <span className="text-sm font-medium text-gray-500">No hay objetivos</span>}
              {/* completed if the status is equal or more */}
              {dashboardData?.currentGoals.individualGoalsStatus >= dashboardData?.currentGoals.individualGoals?.target && <span className="text-green-500 text-sm">
                Completado</span >}

            </p>

            {dashboardData?.currentGoals.individualGoals && (
              <>
                <p className="text-sm font-semibold text-gray-500">Progreso:
                  
                  {dashboardData?.currentGoals.individualGoalsStatus}
                  /{dashboardData?.currentGoals.individualGoals.target}</p>
                <small className="text-gray-500 text-xs">
                  Del {new Date(dashboardData?.currentGoals.individualGoals.startDate).toLocaleDateString()} a {new Date(dashboardData?.currentGoals.individualGoals.endDate).toLocaleDateString()}

                </small>
              </>
            )}
          </div>}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md col-span-4 md:col-span-4 lg:col-span-2  ">
          <h2 className="text-xl font-semibold pb-2">Gráfico de Prospectos por Estado</h2>
          <small className="text-gray-500">Filtrar por fecha y estado</small>
          <div className="mb-4 flex flex-wrap mt-3">
            <div className="flex w-full gap-4">
              <div className="flex flex-col gap-2 flex-grow">
                <label className="mr-2">Desde:</label>
                <input
                  name="startDate"
                  onChange={handleInterval}
                  type="date"
                  className="border border-gray-300 p-2 rounded-md mr-4 w-full"
                />
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <label className="mr-2">Hasta:</label>
                <input
                  name="endDate"
                  onChange={handleInterval}
                  type="date"
                  className="border border-gray-300 p-2 rounded-md mr-4 w-full"
                />
              </div>
            </div>
          </div>
          {option && <ReactECharts option={option} className="text-sm" style={{ height: "330px" }} />}
          {option?.series[0]?.data?.length === 0 && (
            <div className="text-center text-gray-500 absolute top-[60%] left-[15%] md:left-[20%]">
              No hay datos para mostrar en el gráfico
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md col-span-4 md:col-span-4 lg:col-span-2">
          <h2 className="text-xl font-semibold pb-2">Prospectos por Edad</h2>
          <small className="text-gray-500">Se muestra la cantidad de prospectos por rango de edad</small>
          <div className="mt-4">
            {ageOption && <ReactECharts option={ageOption} className="text-sm h-full" style={{ height: "400px" }} />}
            {ageOption?.series[0]?.data?.length === 0 && (
              <div className="text-center text-gray-500 absolute top-[60%] left-[15%] md:left-[20%]">
                No hay datos para mostrar en el gráfico
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md col-span-4 md:col-span-4 lg:col-span-2">
          <h2 className="text-xl font-semibold">Prospectos por {tabs.find(tab => tab.key === activeTab)?.label}</h2>
          <small className="text-gray-500">Filtrar por {tabs.find(tab => tab.key === activeTab)?.label.toLowerCase()}</small>
          <div className="flex justify-center mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-md mr-2 ${activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="text-left bg-gray-100">
                  {renderTableHeaders()}
                </tr>
              </thead>
              <tbody>
                {renderTableData()?.sort(
                  (a: any, b: any) => b.count - a.count
                ).map((item: any, index: number) => (
                  <tr key={index} className={`border border-gray-300 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                    {activeTab === "banks" ? (
                      <td className="p-2">{item._id?.name ?? "Sin definir"}</td>
                    ) : (
                      <td className="p-2">{item._id ? item._id : "Sin definir"}</td>
                    )}
                    <td className="p-2">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {
          user.role === "ADMIN" &&
          renderAdvisorTable()}
      </div>
      {/* ) : (
        <div className="bg-red-600 text-white font-semibold p-4 rounded-md shadow-md">
          No tienes permiso para acceder a este contenido
        </div>
      )} */}
    </Layout>
  );
}

export default Dashboard;
