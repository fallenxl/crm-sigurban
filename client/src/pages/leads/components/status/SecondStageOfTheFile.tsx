import { Checkbox } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { getBankById } from "../../../../services/bank.services";
import { Bank } from "../../../../interfaces";
import { isArrayOfStrings } from "../../../../utils";

interface Props {
  bankID: string;
  lead: any;
  handleDocumentsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export function SecondStageOfTheFile({ bankID, handleDocumentsChange, lead }: Props) {
  const [bank, setBank] = useState<Bank>({
    _id: "",
    name: "",
    description: "",
    createdAt: "",
    financingPrograms: [],
    requirements: [],
  });
  useEffect(() => {
    getBankById(bankID).then((res) => {
      setBank(res?.data);
    });
  }, [bankID]);
  return (
    <>
    <span className="text-sm text-gray-700 font-bold">Requisitos Bancarios</span>
      <div className="flex flex-wrap gap-3">
        {(bank.requirements?.length === 0 || !bank.requirements) && (
            <p>No hay requisitos para este banco</p>
        )}
        {bank.requirements?.map((req, index) => (
          <Checkbox
            key={index}
            crossOrigin={undefined}
            name={req}
            onChange={handleDocumentsChange}
            label={req}
            color="light-blue"
            defaultChecked={isArrayOfStrings(lead.documents) && lead.documents?.includes(req)}

            required
          />
        ))}

      </div>
      {bank.financingPrograms?.length > 0 && (
        <span className="text-sm text-gray-700 font-bold">
           <span className="text-red-500 ">*</span> Al seleccionar todos los requisitos bancarios, se tomara como que el prospecto cumple con todos los requisitos,
            por favor revisa antes de seleccionar.
        </span>
      )}
    </>
  );
}
