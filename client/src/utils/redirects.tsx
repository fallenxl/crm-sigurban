import { useNavigate } from "react-router-dom";

export const validateID = (id: string) => {
  const navigate = useNavigate();
  if (id.length !== 24) {
    navigate("/404");
  }
};

export const isError = (response: boolean, path: string = '/404') => {
    const navigate = useNavigate();
    if(response){
        navigate(path);
    }
};