import { useEffect, useState } from "react";
import { Layout } from "../../Layout";
import { findRoles } from "../../../services/roles.service";
import { RoleCard } from "./RoleCard";
import { Button } from "@material-tailwind/react";
import { CreateRole } from "./CreateRole";
import { IRole } from "../../../interfaces/role.interface";

export function RolesPage() {
  const [roles, setRoles] = useState<IRole[]>([]);
  useEffect(() => {
    findRoles().then((data) => {
      setRoles(data);
    });
  }, []);
  const [openModal, setOpenModal] = useState(false);
  return (
    <>
      <Layout title="Roles">
        <div>
          <Button color="blue" onClick={() => setOpenModal(true)}>
            Crear
          </Button>
          <div className="w-full flex flex-wrap gap-4 mt-4">
            {roles?.map((role) => (
              <RoleCard key={role._id} role={role} />
            ))
          }
          </div>
        </div>
      {openModal && <CreateRole setRoles={setRoles}  handleCloseModal={setOpenModal}/>}
      </Layout>
    </>
  );
}
