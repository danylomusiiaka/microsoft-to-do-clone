"use client";

import { SlideProps } from "@mui/material/Slide";

import React, { ReactNode, Suspense, createContext, lazy, useContext, useState } from "react";

interface AlertState {
  key: number;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  variant: "filled" | "outlined" | "standard";
}

interface AlertContextType {
  showAlert: (message: string, severity?: AlertState["severity"], variant?: AlertState["variant"]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

const Snackbar = lazy(() => import("@mui/material/Snackbar"));
const Alert = lazy(() => import("@mui/material/Alert"));
const Slide = lazy(() => import("@mui/material/Slide"));

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const showAlert = (message: string, severity: AlertState["severity"] = "success", variant: AlertState["variant"] = "filled") => {
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
      <Suspense>
        <Snackbar
          key={alert?.key}
          open={openSnackbar}
          onClose={handleClose}
          TransitionComponent={SlideTransition}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ pointerEvents: "none" }}
        >
          <Alert severity={alert?.severity || "success"} variant={alert?.variant} sx={{ fontSize: "1.05rem", pointerEvents: "auto" }}>
            {alert?.message}
          </Alert>
        </Snackbar>
      </Suspense>
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
