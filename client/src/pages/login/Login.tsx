import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../services";
import { setAuth } from "../../redux/states/auth.state";
import { useNavigate } from "react-router-dom";
import { LocalStorageKeys } from "../../constants";
import { getLocalStorage, removeLocalStorage } from "../../utils";
import { Loading } from "../../component";
import { AuthAccount } from "../../interfaces";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { LogoSigUrban } from "../../component/logo/LogoSigUrban";
import { setSocket } from "../../redux/states/socket.state";
import { io } from "socket.io-client";

function Login() {
  const [account, setAccount] = useState<AuthAccount | undefined>();
  const [openOtherAccount, setOpenOtherAccount] = useState(true);
  const [openCard, setOpenCard] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  /*
   *  Si el usuario ya inició sesión, se elimina la información de la sesión
   */
  useEffect(() => {
    removeLocalStorage(LocalStorageKeys.DATA);
    const user = getLocalStorage<AuthAccount | undefined>(
      LocalStorageKeys.USER_ACCOUNT
    );
    if (user?.name && user?.email) {
      setAccount(user);
      setEmail(user.email);
      setOpenOtherAccount(false);
      setOpenCard(false);
    }
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Cambiar valores de los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  // Eliminar tarjeta de usuario
  const handleRemoveAccountClick = () => {
    removeLocalStorage(LocalStorageKeys.USER_ACCOUNT);
    setAccount(undefined);
    setEmail("");
    setPassword("");
    setOpenCard(false);
    setOpenOtherAccount(true); // Asegura que openCard esté configurado en true
  };

  // Abrir tarjeta de otra cuenta
  const handleOpenOtherAccountClick = () => {
    if (openCard) {
      setOpenCard(false);
    }

    if (!openOtherAccount) {
      setEmail("");
    }

    setOpenOtherAccount(!openOtherAccount);
  };

  // Abrir tarjeta de usuario
  const handleOpenCardClick = () => {
    if (openOtherAccount) {
      setOpenOtherAccount(false);
      setEmail(account?.email || "");
    }

    if (!openCard) {
      setEmail(account?.email || "");
    }

    setOpenCard(!openCard);
  };

  // Enviar datos al servidor
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await login({ email, password });
      setLoading(false);
      if (!data) return setError("Usuario o contraseña incorrectos");
      dispatch(setSocket(io(process.env.NODE_ENV === 'production'? "wss://api.crm.sigurban.com/" : 'http://localhost:8282', {transports: ['websocket']})));
      dispatch(setAuth(data));
      navigate(
        data.user.role === "BANK_MANAGER"
          ? "/prospectos/lista?status=Precalificar+Banco"
          : data.user.role === "MANAGER"
          ? "/prospectos/lista?status=Precalificar+Buró"
          : "/prospectos/lista",
        { replace: true }
      );
    } catch (error) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <main className="h-screen w-full flex relative  dark:bg-neutral-800 ">
      {/* Loading component */}
      {loading && <Loading />}
      <div className="hidden xl:block absolute inset-0 -z-10 h-full w-full bg-gray-50 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      {/* CONTAINER */}
      <div className="w-full flex items-center justify-center gap-x-10 p-0 md:p-10">
        
        {/* Login container (RIGHT) */}
        <div className="w-5/6 lg:w-3/6 gap-y-8 py-10  h-auto border-none xl:border xl:bg-white rounded-md">
          <div className="p-0   xl:px-[80px] ">
            <div className="w-full flex flex-col items-center gap-y-10">
              <div className="w-full flex flex-col gap-y-3">
                <div className="w-full flex flex-col justify-center items-center mb-10">
                  <LogoSigUrban className="w-32 h-32" />
                  <small className="mt-4 text-lg">
                    Construyendo Hogares Felices
                  </small>
                </div>
                <div>
                  <h2 className="font-bold text-2xl text-[var(--primary)] ">
                    Iniciar sesión
                  </h2>
                  <small className="dark:text-white">
                    Inicio de sesión rápido, ultima cuenta utilizada:
                  </small>
                </div>
                {error && (
                  <div className="w-full bg-red-100 text-red-500 px-5 py-3 rounded">
                    {error}
                  </div>
                )}
                {/* User card */}
                {account && (
                  <div className="flex justify-between w-full bg-slate-50 px-5 py-3 rounded hover:bg-slate-100 duration-200 bg-gray-100 hover:bg-gray-200">
                    <div
                      onClick={handleOpenCardClick}
                      className="flex items-center gap-x-5 cursor-pointer w-3/5"
                    >
                      <img
                        src={`https://api.dicebear.com/5.x/initials/svg?seed=${
                          account.name.split(" ")[0]
                        }`}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                      <small>
                        Welcome back,{" "}
                        <strong>{account.name.split(" ")[0]}</strong>
                      </small>
                    </div>
                    <button
                      onClick={handleRemoveAccountClick}
                      className="text-red-600 text-sm hover:text-red-500 hover:scale-95 duration-150"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
                {/* Login form */}
                <form
                  onSubmit={handleSubmit}
                  className="mt-5 flex flex-col gap-y-6 w-full "
                >
                  {openCard && (
                    <div className="flex flex-col ">
                      <label
                        htmlFor="password"
                        className="text-sm px-2 dark:text-white"
                      >
                        Contraseña:
                      </label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Escribe tu contraseña"
                        className="outline-none border-b px-2 text-sm py-3 rounded-md"
                        onChange={handleChange}
                        value={password}
                      />
                    </div>
                  )}
                  {openOtherAccount && (
                    <>
                      <div className="flex flex-col">
                        <label
                          htmlFor="email"
                          className="text-sm px-2 dark:text-white"
                        >
                          Correo electrónico:
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="Escribe tu correo electrónico"
                          className="outline-none border-b px-2 text-sm py-3 rounded-md"
                          onChange={handleChange}
                          value={email}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="password"
                          className="text-sm px-2 dark:text-white"
                        >
                          Contraseña:
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Escribe tu contraseña"
                          className="outline-none border-b px-2 text-sm py-3 rounded-md"
                          onChange={handleChange}
                          value={password}
                        />
                      </div>
                    </>
                  )}
                  <div
                    className={`w-full flex items-center ${
                      account ? "justify-between" : "justify-end"
                    } border-b pb-10`}
                  >
                    {account && (
                      <span
                        onClick={handleOpenOtherAccountClick}
                        className="dark:text-white font-bold text-clip text-xs underline text-gray-500 cursor-pointer hover:text-gray-800 duration-200"
                      >
                        Iniciar sesión con otra cuenta
                      </span>
                    )}
                    <button className="bg-[var(--primary)]  pl-4 pr-2 py-2 text-white rounded-md flex items-center justify-between hover:scale-95 duration-300">
                      Login
                      <ChevronRightIcon className="w-5 h-5 ml-2 stroke-white" />
                    </button>
                  </div>
                </form>
              </div>
              <div className="w-full flex flex-col items-end gap-y-3">
                <small className="dark:text-white">
                  Powered by Naranja & Media 🍊
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
