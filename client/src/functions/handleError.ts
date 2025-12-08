import { AxiosError } from "axios";

export const handleError = (error: any, showAlert?: (message: string, type: "success" | "error") => void) => {
  if (error instanceof Error) {
    if (showAlert) {
      showAlert(error.message, "error");
    } else {
      console.error(error.message);
    }
  } else if (error instanceof AxiosError) {
    if (showAlert) {
      showAlert(error.response?.data, "error");
    } else {
      console.error(error.response?.data);
    }
  } else {
    if (showAlert) {
      showAlert("Щось пішло не так", "error");
    } else {
      console.error("Щось пішло не так");
    }
  }
};
