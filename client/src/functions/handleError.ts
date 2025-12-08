import { AxiosError } from "axios";

export const handleError = (error: any, showAlert: (message: string, type: "success" | "error") => void) => {
  if (error instanceof AxiosError) {
    showAlert(error.response?.data, "error");
  } else if (error instanceof Error) {
    showAlert(error.message, "error");
  } else {
    showAlert("Щось пішло не так", "error");
  }
};
