import React, { createContext, useContext, useState } from "react";

const AuthStatusContext = createContext({ status: "checking", setStatus: function () {} });

function AuthStatusProvider(props) {
  var [status, setStatus] = useState("checking");
  return (
    <AuthStatusContext.Provider value={{ status: status, setStatus: setStatus }}>
      {props.children}
    </AuthStatusContext.Provider>
  );
}

function useAuthStatus() {
  return useContext(AuthStatusContext);
}

export { AuthStatusProvider, useAuthStatus };