import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "../component/modal/Modal";
import { useEffect, useState } from "react";
import { getAllBanks, getBankById } from "../services/bank.services";
import { Bank } from "../interfaces";
import { updateLeadService } from "../services/lead.services";
import { errorAlert } from "../component/alerts/Alerts";
interface Props {
  onClose: () => void;
  lead: any;
}
export function ChangeBankModal({ onClose, lead }: Props) {
  const [banks, setBanks] = useState([]);
  const [bankSelected, setBankSelected] = useState("");
  const [bank, setBank] = useState({} as Bank);
  const [banksAvailable, setBanksAvailable] = useState(true);
  const handleBankChange = (e: any) => {
    setBankSelected(e.target.value);
  };

  useEffect(() => {
    getAllBanks().then((banks) => {
      setBanks(banks);
      setBanksAvailable(verifyBanksAvailable(banks, lead.rejectedBanks));
    });
  }, []);

  useEffect(() => {
    getBankById(bankSelected).then((res) => {
      if (typeof res === "string") return;
      setBank(res?.data as Bank);
    });
  }, [bankSelected]);

  const verifyBanksAvailable = (banks: any, rejectedBanks: any) => {
    if (rejectedBanks.length === 0) return true;
    const availableBanks = banks.filter((bank: any) => {
      return !rejectedBanks.some(
        (rejectedBank: any) => rejectedBank._id === bank._id
      );
    });
    if (availableBanks.length > 0) return true;
    return false;
  };

  const isBankAvailable = (id: string) => {
    return lead.rejectedBanks?.some(
      (rejectedBank: any) => rejectedBank._id === id
    );
  };

  const [financingProgramSelected, setFinancingProgramSelected] = useState("");
  const handleFinancingProgramChange = (e: any) => {
    setFinancingProgramSelected(e.target.value);
  };

  async function handleSubmit() {
    try {
      const payload = {
        bankID: bankSelected,
        financingProgram: financingProgramSelected,
        updatedColumns: ['bankID', 'financingProgram']
      };

      console.log(payload)
      updateLeadService(lead._id, payload).then((res) => {
        if (typeof res === "string") {
          errorAlert("ups!", res);
        }
        setBankSelected("");
        setFinancingProgramSelected("");
        onClose()
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Modal>
      {/* Title */}
      <div className="flex justify-between bg-gray-50 px-4 py-5 sm:px-6 border-b ">
        <h3 className="text-lg leading-6 font-medium text-gray-800">
          Editar Banco
        </h3>
        <XMarkIcon
          className="h-6 w-6 text-gray-500 cursor-pointer"
          onClick={onClose}
        />
      </div>
      {/* Content */}
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start flex-col gap-4 ">
          {banksAvailable && (
            <>
              <label htmlFor="selectBank" className="text-gray-600 font-bold">
                Seleccionar banco:
              </label>
              <select
                name="selectBank"
                className="border border-gray-300 rounded-md p-2 w-full"
                onChange={handleBankChange}
                value={bankSelected}
                required
              >
                <option value="" defaultChecked disabled>
                  Seleccionar banco
                </option>

                {banks &&
                  banks.map((item: any) => {
                    return (
                      <>
                        {isBankAvailable(item._id) ? (
                          <option key={item._id} value={item._id} disabled>
                            {item.name} (Rechazado)
                          </option>
                        ) : (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        )}
                      </>
                    );
                  })}
              </select>

              {bankSelected && (
                <>
                  <label
                    htmlFor="selectFinancingProgram"
                    className="text-gray-600 font-bold"
                  >
                    Seleccionar programa de financiamiento:
                  </label>
                  <select
                    name="selectFinancingProgram"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    onChange={handleFinancingProgramChange}
                    value={financingProgramSelected}
                    required
                  >
                    <option value="" defaultChecked disabled>
                      Seleccionar programa de financiamiento
                    </option>

                    {bank.financingPrograms?.map((item, index) => {
                      return (
                        <option
                          key={index}
                          value={`${item.name} - ${item.interestRate}%`}
                        >
                          {item.name} - {item.interestRate}%{" "}
                        </option>
                      );
                    })}
                  </select>
                  {financingProgramSelected && (
                    <span className="text-gray-600">
                      Descripción:{" "}
                      {
                        bank.financingPrograms?.find(
                          (program) =>
                            program.name ===
                            financingProgramSelected.split(" - ")[0]
                        )?.description
                      }
                    </span>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none  sm:ml-3 sm:w-auto sm:text-sm"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none  sm:mt-0 sm:w-auto sm:text-sm"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
