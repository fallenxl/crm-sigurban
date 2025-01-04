import {useNavigate} from 'react-router-dom'
import { Layout } from './Layout'
export const NotFound = () => {
     const navigate = useNavigate()
        const handleClick = () => {
            navigate(-1)
        }
    return (<>
       <Layout title='404'>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <h1 className="text-6xl font-semibold text-gray-700 dark:text-gray-200">404</h1>
            <p className="text-gray-700 dark:text-gray-300">Pagina no encontrada. Verifica la dirección o <button onClick={handleClick} className="text-indigo-600 hover:underline dark:text-indigo-300">regresar atrás</button>.</p>
        </div>
       </Layout>
    </>)
}