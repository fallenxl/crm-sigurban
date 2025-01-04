import {Layout} from "../Layout.tsx";
import {Card} from "@material-tailwind/react";
import {useEffect, useState} from "react";
import {getAllLotsByProjectID, getAllProjects} from "../../services/projects.services.ts";
import {IProject} from "../../interfaces";

export function ProjectPlans() {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [svg, setSvg] = useState('');
    // const [lots, setLots] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    useEffect(() => {

        getAllProjects().then((res) => {
            if (typeof res === "string") return;
            setProjects(res?.data);
            const projectID = window.location.search.split('proyecto=')[1];
            if (projectID) setSelectedProject(projectID);
        });
    }, []);

    useEffect(() => {
        if (selectedProject === '') return;


        const project = projects.find((project) => project._id === selectedProject);
        setSvg(project?.svg ?? '');
        getAllLotsByProjectID(selectedProject).then((res) => {
                if (typeof res === "string") return;
                const lotsAsSVG = res.lots
                    ?.filter((lot: any) => lot.svgPath !== '' && lot.svgPath !== null && lot.svgPath !== undefined)
                    .map((lot: any) => `<a href="/lotes/${lot._id}" >
<path d="${lot.svgPath}"  class="${(lot.status === 'Disponible' || lot.status === 'Potencial') ? 'fill-green-500' : lot.status === 'Reservado' ? 'fill-blue-500' : 'fill-red-500'} opacity-30"
 "/>
</a>`)
                    .join('');
                setSvg((prev: string) => {
                    return prev.replace('<!-- children -->', lotsAsSVG);
                });

            }
        );


    }, [selectedProject]);

    const handleSelectProject = (e: any) => {
        setSelectedProject(e.target.value);
        const url = new URLSearchParams(window.location.search);
        url.set('proyecto', e.target.value);
        window.history.pushState({}, '', `${window.location.pathname}?${url.toString()}`);
    }
    return (
        <Layout title={"Plano de Proyectos"}>

            <Card className={
                'p-5'
            }>
                <div className="flex items-center justify-center gap-3">
                    <label htmlFor="project" className="">Selecciona un proyecto:</label>
                    <select value={selectedProject} onChange={handleSelectProject}
                            className="w-1/3 my-5 p-2 border border-gray-300 rounded-md outline-0">
                        <option value="" disabled={true}>Selecciona un proyecto</option>
                        {projects.map((project, index) => {
                            return (
                                <option key={index} value={project._id}>{project.name}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="w-full md:w-2/3 flex flex-wrap justify-center mx-auto py-10">
                    {svg ? (<div className={'w-full'} dangerouslySetInnerHTML={{__html: svg}}>
                    </div>) : (
                        <div className="text-center w-full min-h-[calc(100vh-300px)] flex items-center justify-center">
                            <small className="text-gray-600">Selecciona un proyecto para ver los planos</small>
                        </div>

                    )}
                </div>
            </Card>
        </Layout>
    )
}