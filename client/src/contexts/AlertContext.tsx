"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";

import React, { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { TransitionGroup } from "react-transition-group";

interface AlertState {
  id: number;
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

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (message: string, severity: AlertState["severity"] = "success", variant: AlertState["variant"] = "filled") => {
      const id = Date.now();
      const newAlert: AlertState = { id, message, severity, variant };

      setAlerts((prev) => {
        const updatedAlerts = [...prev, newAlert];
        if (updatedAlerts.length > 5) {
          return updatedAlerts.slice(updatedAlerts.length - 5);
        }
        return updatedAlerts;
      });

      setTimeout(() => {
        removeAlert(id);
      }, 4000);
    },
    [removeAlert]
  );

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Box
        sx={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <TransitionGroup>
          {alerts.map((alert) => (
            <Slide key={alert.id} direction="left">
              <Box sx={{ marginBottom: 1 }}>
                <Alert
                  severity={alert.severity}
                  variant={alert.variant}
                  sx={{
                    fontSize: "1.05rem",
                    boxShadow: 3,
                  }}
                >
                  {alert.message}
                </Alert>
              </Box>
            </Slide>
          ))}
        </TransitionGroup>
      </Box>
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
