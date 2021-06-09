import React, { useState } from "react";
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
import { register } from "api";

const Register: React.FC<{}> = () => {
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

  const handleChange = (prop: string) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: any) => {
    event.preventDefault();
  };
  const handleRegister = async () => {
    let res = await register({
      username: values.username,
      password: values.password,
    });
  };
  return (
    <div className="register-page">
      <div className="register-form">
        <div className="register-form-title">R E G I S T E R</div>
        <FormControl
          fullWidth
          variant="outlined"
          className="register-form-item"
        >
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
          className={"register-form-item " + classes.margin}
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
        <Button className="btn" disableElevation onClick={handleRegister}>
          Register
        </Button>
        <div className="tip">
          already has an account? login <a href="/login">here</a>
        </div>
      </div>
    </div>
  );
};
export default Register;
