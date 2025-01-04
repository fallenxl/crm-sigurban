import { useEffect, useState } from "react";
import { updateLeadService } from "../../services/lead.services";
import { useSelector } from "react-redux";

export const useEditLead = (id: string | undefined, lead: any) => {
  const [updateLead, setUpdateLead] = useState<any>({
    name: "",
    dni: "",
    passport: "",
    birthdate: "",
    residenceNumber: "",
    phone: "",
    address: "",
    genre: "",
    email: "",
    department: "",
    municipality: "",
    country: "",
    interestedIn: "",
    comment: "",
    source: "",
    salary: "",
    workAddress: "",
    workTime: "",
    paymentMethod: "",
    workPosition: "",
  });
  const [updatedColumns, setUpdatedColumns] = useState<any>([]);
  const [edit, setEdit] = useState(true);
  const socket = useSelector((state: any) => state.socket.socket);
  useEffect(() => {
    setUpdateLead({
      name: lead.name,
      dni: lead.dni,
        passport: lead.passport,
        residenceNumber: lead.residenceNumber,
        birthdate: lead.birthdate?? "",
      genre: lead.genre,
      phone: lead.phone,
      address: lead.address,
      department: lead.department,
      municipality: lead.municipality,
      country: lead.country,
      email: lead.email,
      interestedIn: lead.interestedIn,
      comment: lead.comment,
      source: lead.source,
      salary: lead.salary,
      workAddress: lead.workAddress,
      workTime: lead.workTime,
      paymentMethod: lead.paymentMethod,
      workPosition: lead.workPosition,
    });
  }, [lead, id]);

  const handleUpdateLeadChange = (e: any) => {
    // add only once the column to the array and remove it if the value is the same as the original

    setUpdateLead({
      ...updateLead,
      [e.target.name]: e.target.value,
    });

    setUpdatedColumns((prev: any) => {
      if (!prev.includes(e.target.name)) {
        return [...prev, e.target.name];
      } else if (lead[e.target.name] === e.target.value) {
        return prev.filter((column: any) => column !== e.target.name);
      }
      return prev;
    });
  };

  const handleEdit = () => {
    setEdit(!edit);
  };

  const handleCancelEdit = () => {
    setUpdateLead(lead);
    setEdit(true);
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    updateLeadService(id, { ...updateLead, updatedColumns }).then((res) => {
      if (res) {
        setEdit(true);
        socket.emit("leadUpdated");
      }
    });
  };

  return {
    updateLead,
    edit,
    handleUpdateLeadChange,
    handleEdit,
    handleCancelEdit,
    handleSubmit,
  };
};
