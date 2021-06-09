import Login from "./login";
import Register from "./register";
import Room from "./room";
import Home from "./home";

export interface Route {
  path: string;
  name: string;
  component: React.Component<any, any> | React.FC<any>;
  auth: boolean;
}
export const Routers: Route[] = [
  { path: "/", name: "Login", component: Login, auth: false },
  { path: "/login", name: "Login", component: Login, auth: false },
  { path: "/register", name: "Register", component: Register, auth: false },
  { path: "/room", name: "Room", component: Room, auth: true },
  { path: "/home", name: "Home", component: Home, auth: true },
];
