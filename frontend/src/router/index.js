import Login from "../pages/login/Login";
import Profile from "../pages/profile/Profile";
import ManageDevice from "../pages/manageDevice/ManageDevice";
import History from "../pages/history/History";
import DeviceInfo from "../pages/deviceInfo/DeviceInfo";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
const routers = [
  {
    path: "/",
    component: Login,
    layout: null,
  },
];
const appRouters = [
  {
    path: "/dashboard",
    component: Dashboard,
    layout: MainLayout,
  },
  {
    path: "/profile",
    component: Profile,
    layout: MainLayout,
  },
  {
    path: "/manage-device",
    component: ManageDevice,
    layout: MainLayout,
  },
  {
    path: "/history",
    component: History,
    layout: MainLayout,
  },
  {
    path: "/device-info/:id",
    component: DeviceInfo,
    layout: MainLayout,
  },
];

export { routers, appRouters };
