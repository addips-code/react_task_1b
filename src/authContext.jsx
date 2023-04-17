import React, { useReducer, useEffect } from "react";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      const { user, token, role } = action.payload;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      return {
        ...state,
        isAuthenticated: true,
        user: user,
        token: token,
        role: role,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage) => {
  const role = localStorage.getItem("role");
  if (errorMessage === "TOKEN_EXPIRED") {
    dispatch({
      type: "Logout",
    });
    window.location.href = "/" + role + "/login";
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      sdk.verifyToken(token)
        .then((response) => {
          dispatch({
            type: "LOGIN",
            payload: {
              user: response.data.user,
              token: token,
              role: role,
            },
          });
        })
        .catch((error) => {
          if (error.response && error.response.data.error === "TOKEN_EXPIRED") {
            tokenExpireError(dispatch, "TOKEN_EXPIRED");
          }
        });
    }
  }, []);

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("x-project", "cmVhY3R0YXNrOmQ5aGVkeWN5djZwN3p3OHhpMzR0OWJtdHNqc2lneTV0Nw==");
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2ODE3NTIyODgsImV4cCI6MTY4MTc1NTg4OH0.lpDUomtR18QBEklUI51QR-KmBKZJxW2TVdrneNRpJGU");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "page": 2,
      "limit": 10
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://reacttask.mkdlabs.com/v1/api/rest/video/PAGINATE", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
