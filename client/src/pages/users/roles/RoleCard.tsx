interface Role {
    name: string;
    permissions: {
      module: string;
      access: string[];
    }[];
}
interface Props {
    role: Role;

}
export function RoleCard({role}: Props){
    return (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs flex-grow">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">{role.name}</h2>
                </div>
                <div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Editar</button>
                </div>
            </div>
            
        </div>
    )
}