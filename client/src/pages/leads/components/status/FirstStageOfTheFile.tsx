import { Checkbox } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { getRequirementByName } from "../../../../services/requirements.services";
import { isArrayOfStrings } from "../../../../utils";

interface Props {
  handleDocumentsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lead : any;
}
export function FirstStageOfTheFile({ handleDocumentsChange, lead }: Props) {
  const [requirements, setRequirements] = useState([]);
  useEffect(() => {
    getRequirementByName("Segunda Etapa").then((res: any) => {
      if (res.data) {
        setRequirements(res.data[0]?.requirements ?? []);
      }
    });
  }, []);
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {requirements.map((requirement: string, index: number) => (
          <Checkbox
            key={index}
            crossOrigin={undefined}
            name={requirement}
            onChange={handleDocumentsChange}
            label={requirement}
            color="light-blue"
            defaultChecked={isArrayOfStrings(lead.documents) && lead.documents?.includes(requirement)}
            required
          />
        ))}
      </div>
    </>
  );
}
