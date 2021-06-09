import React, { useContext, useEffect, useState } from "react";
import {
  InputLabel,
  FormControl,
  InputAdornment,
  IconButton,
  OutlinedInput,
  makeStyles,
  Button,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import "./index.less";
import { useHistory } from "react-router-dom";
import { login } from "../api";
import { AppContext } from "App";
const Login = (props: any) => {
  const context = useContext(AppContext);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexWrap: "wrap",
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  }));
  const classes = useStyles();
  const [values, setValues] = useState({
    username: "",
    password: "",
    room: "",
    showPassword: false,
  });

  const history = useHistory();

  const handleChange = (prop: string) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: any) => {
    event.preventDefault();
  };

  const handleLogin = async () => {
    let {
      data: { code, user_id, user_name },
    } = await login({ username: values.username, password: values.password });

    if (code === 200) {
      context.updateUser({ user_id, user_name });
      context.updateAuth(true);
      history.push("/home");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <div className="login-form-title">L O G I N</div>
        <FormControl fullWidth variant="outlined" className="login-form-item">
          <InputLabel htmlFor="username">Username</InputLabel>
          <OutlinedInput
            id="username"
            label="Username"
            onChange={handleChange("username")}
            value={values.username}
          />
        </FormControl>
        <FormControl
          fullWidth
          variant="outlined"
          className={"login-form-item " + classes.margin}
        >
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            label="Password"
            type={values.showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange("password")}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Button className="btn" disableElevation onClick={handleLogin}>
          Login
        </Button>
        <div className="tip">
          doesnt have any account? register{" "}
          <a
            href="/register"
            onClick={() => {
              history.push({ pathname: "/register" });
            }}
          >
            here
          </a>
        </div>
      </div>
    </div>
  );
};
export default Login;
