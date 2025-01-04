export default function SendToBank() {
  return (
    <>
      {
        <>
          <label htmlFor="sendToBank">Cliente fue aprobado en el Banco?</label>
          <select
            name="projectName"
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="" defaultChecked disabled>
              Seleccionar
            </option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </>
      }
    </>
  );
}
