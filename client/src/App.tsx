import React, { createContext, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { Routers } from "./routerMap";
import "./App.less";
import { verify } from "api";

type User = {
  user_id: string;
  user_name: string;
};
type ContextProps = {
  auth: boolean;
  user: User;
  IO: any;
  updateIO: (io: any) => void;
  updateUser: (user: User) => void;
  updateAuth: (user: boolean) => void;
};
export const AppContext = createContext<ContextProps>(null!);
function App() {
  const [auth, setAuth] = useState(true);
  const [user, setUser] = useState<User>({ user_id: "", user_name: "" });
  const [IO, setIO] = useState(null!);
  const isFirstRender = useRef(true);

  const handleVerify = async () => {
    let {
      data: { code, user_name, user_id },
    } = await verify();
    if (code === 200) {
      setAuth(true);
      updateUser({ user_name, user_id });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) handleVerify();
    isFirstRender.current = false;

    // return () => {
    //   isFirstRender.current = true;
    // };
  }, []);

  const updateUser = (u: User) => {
    setUser(u);
  };
  const updateIO = (io: any) => {
    setIO(io);
  };
  const updateAuth = (auth: boolean) => {
    setAuth(auth);
  };

  return (
    <AppContext.Provider
      value={{ auth, user, IO, updateIO, updateUser, updateAuth }}
    >
      <div className="App">
        <Router basename="/">
          <Switch>
            {Routers.map((item, index) => {
              return (
                <Route
                  key={index}
                  path={item.path}
                  exact
                  render={(props) =>
                    !item.auth ? (
                      // @ts-ignore
                      <item.component {...props} />
                    ) : auth ? (
                      // @ts-ignore
                      <item.component {...props} auth={auth} />
                    ) : (
                      <Redirect
                        to={{
                          pathname: "/login",
                          state: { from: props.location },
                        }}
                      />
                    )
                  }
                />
              );
            })}
          </Switch>
        </Router>
      </div>
    </AppContext.Provider>
  );
}

export default App;
