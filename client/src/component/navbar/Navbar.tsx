import {
  Navbar,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  Avatar,
  MenuItem,
  Tooltip,
} from "@material-tailwind/react";
import {
  EnvelopeOpenIcon,
  BellIcon,
  Bars2Icon,
  PowerIcon,
  BugAntIcon, UserIcon,
} from "@heroicons/react/24/outline";
import { getDays, getLocalStorage, getTimeOfDay } from "../../utils";
import { LocalStorageKeys, PublicRoutes } from "../../constants";
import { AuthResponse } from "../../interfaces";
import {Link, useNavigate} from "react-router-dom";
import { logout } from "../../services";
import { useEffect, useState } from "react";
import {
  getNotifications,
  readAllNotifications,
  readNotificationById,
} from "../../services/notifications.services";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";
import { Dialog } from "../dialog/Dialog";
import {getUserSettings} from "../../services/user.services.ts";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  leadID?: string;
  createdAt: Date;
}
interface Props {
  setOpenSidebar: () => void;
  openSidebar: boolean;
}

export function NavbarWithSearch({ setOpenSidebar }: Props) {
  const navigate = useNavigate();
  // Get user data from local storage
  const user = getLocalStorage<AuthResponse>(LocalStorageKeys.DATA);
  const [settings, setSettings] = useState(user?.user.settings ?? { autoAssign: false, notificationsSound: true } );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const socket = useSelector((state: AppStore) => state.socket.socket);
  const handleSignOut = () => {
    logout();
    navigate(PublicRoutes.LOGIN, { replace: true });
  };
  const [openDialog, setOpenDialog] = useState(false);
  useEffect(() => {
    getNotifications(4, page).then((response) => {
      setNotifications([...notifications, ...response]);
    });

    getUserSettings(user?.user.id!).then((res) => {
        setSettings({
            ...settings,
            notificationsSound: res.notificationsSound??false,
        });
    });

    function handleLeadUpdated(data:string[]){
      {
        getNotifications(4, page).then((response) => {
          setNotifications([...notifications, ...response]);
        });

        if (user && (data.includes(user.user.id!) || user.user.role === "ADMIN")) {
          setOpenDialog(true);
          //notification sound
          if(settings.notificationsSound){
            const audio = new Audio('/notification.mp3');
            audio.play();
          }
          setTimeout(() => {
            setOpenDialog(false);

          }, 5000);

          return () => {
            socket.off("leadUpdated")
          }
        }
      }
    }

    socket.on("leadUpdated", handleLeadUpdated);
    return () => {
      socket.off("leadUpdated", handleLeadUpdated)
    }
  }, [page]);

  const handleLoadMore = (e: any) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setPage(page + 1);
    }
  };

  const redirect = (id: string) => {
    window.location.href = `/prospectos/${id}`;
  };

  const handleMarkAllAsRead = async () => {
    await readAllNotifications();
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleReadNotification = async (id: string) => {
    await readNotificationById(id);
    setNotifications(
      notifications.map((notification) =>
        notification._id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Get notifications from api
  return (
    <>
      {openDialog && <Dialog open={openDialog} title="Notificación" message={notifications[0]?.message} />}
      <Navbar
        fullWidth={false}
        className={` px-8 py-3 max-w-[45rem] shadow-sm mb-4 rounded-xl z-10 overflow-auto md:mr-4`}
      >
        <div className="flex flex-wrap items-center justify-between gap-y-4 text-blue-gray-900 ">
          <div className="flex lg:hidden items-center gap-2 mr-4">
            <IconButton
              onClick={setOpenSidebar}
              variant="text"
              color="blue-gray"
            >
              <Bars2Icon className="h-7 w-7" />
            </IconButton>
          </div>
          <span className="hidden md:block text-blue-gray-600 text-sm">
            {getTimeOfDay() + " "}
            <strong>{user?.user.name.split(" ")[0]}</strong>
          </span>
          <div className="ml-auto flex gap-1 md:mr-4">
            {/* Notifications */}
            <Menu
              placement="bottom-end"
              offset={{ crossAxis: 15, mainAxis: 10 }}
            >
              <MenuHandler>
                <IconButton variant="text" color="blue-gray">
                  <div className="relative">
                    <BellIcon
                      className="h-7 w-7 "
                      onClick={handleMarkAllAsRead}
                    />
                    {notifications.some(
                      (notification) => !notification.read
                    ) && (
                      <div className="absolute w-3 h-3 bg-red-400 rounded-full top-0 right-[0.1em]"></div>
                    )}
                  </div>
                </IconButton>
              </MenuHandler>
              <MenuList
                id="notificationsList"
                onScroll={handleLoadMore}
                className="max-h-[30rem] w-auto relative p-0 "
              >
                <div className="sticky top-0 bg-white flex w-full   justify-between outline-none px-4 py-4 border-b z-10">
                  <span className="text-sm font-medium">Notificaciones</span>
                  <Tooltip
                    placement="top"
                    content="Mark all as read"
                    className="bg-white text-blue-gray-500 shadow-md"
                  >
                    <EnvelopeOpenIcon
                      onClick={handleMarkAllAsRead}
                      className="h-5 w-5 mr-2 cursor-pointer hover:stroke-blue-gray-900"
                    />
                  </Tooltip>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <MenuItem
                      onMouseOver={() =>
                        handleReadNotification(notification._id)
                      }
                      key={notification._id}
                      className={`${!notification.read && "bg-gray-50"} mb-2`}
                    >
                      <div className="px-2 pb-4 pt-2 w-[25em] ">
                        <div className="flex items-center justify-between">
                          <h6 className="text-sm font-semibold">
                            {notification.title}
                          </h6>
                          <span className="text-xs text-blue-gray-400">
                            {getDays(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-gray-400">
                          {notification.message}
                        </p>
                        {notification.leadID && (
                          <button
                            onClick={() => redirect(notification.leadID!)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Ver prospecto
                          </button>
                        )}
                      </div>
                    </MenuItem>
                  ))
                ) : (
                  <div className="flex justify-center items-center w-[25em] my-10">
                    No hay notificaciones
                  </div>
                )}
              </MenuList>
            </Menu>
            {/* Profile options */}
            <Menu placement="bottom-end">
              <MenuHandler>
                <Avatar
                  src={user?.user.avatar}
                  withBorder={true}
                  className="cursor-pointer ml-2 h-10 w-10"
                />
              </MenuHandler>
              <MenuList>
                <MenuItem>
                  <div className="flex flex-col w-[15em]">
                    <Link to={'/me'} className={'px-2 py-2 rounded-sm'}>
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 mr-2"/>
                        <span>Mi Perfil</span>
                      </div>
                    </Link>

                  </div>
                </MenuItem>
                <MenuItem>
                  <div className="flex flex-col w-[15em]">
                    <a
                      href="https://forms.gle/A7FSu7MMR5uYHuGG7"
                      target="_blank"
                      className="px-2 py-2 rounded-sm"
                    >
                      <div className="flex items-center">
                        <BugAntIcon className="h-5 w-5 mr-2" />
                        <span>Reportar un problema</span>
                      </div>
                    </a>
                  </div>
                </MenuItem>

                <MenuItem onClick={handleSignOut}>
                  <div className="flex flex-col w-[15em]">
                    <a href="#" className="px-2 py-2 rounded-sm">
                      <div className="flex items-center">
                        <PowerIcon className="h-5 w-5 mr-2" />
                        <span>Log out</span>
                      </div>
                    </a>
                  </div>
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
      </Navbar>
    </>
  );
}
