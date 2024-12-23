"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { SlideProps } from "@mui/material/Slide";

interface AlertState {
  key: number;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  variant: "filled" | "outlined" | "standard";
}

interface AlertContextType {
  showAlert: (
    message: string,
    severity?: AlertState["severity"],
    variant?: AlertState["variant"]
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction='left' />;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const showAlert = (
    message: string,
    severity: AlertState["severity"] = "success",
    variant: AlertState["variant"] = "filled"
  ) => {
    setAlert({ key: Date.now(), message, severity, variant });
    setOpenSnackbar(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar
        key={alert?.key}
        open={openSnackbar}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ pointerEvents: "none" }}
      >
        <Alert
          severity={alert?.severity || "success"}
          variant={alert?.variant}
          sx={{ fontSize: "1.05rem", pointerEvents: "auto" }}
        >
          {alert?.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
