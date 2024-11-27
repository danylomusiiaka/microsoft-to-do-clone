import { format } from "date-fns";
import { uk } from "date-fns/locale";

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "eeee dd MMM", { locale: uk });
  } catch (error) {
    return dateString;
  }
};

export const formatText = (text: string, howShort: number) => {
  if (text.length > howShort) {
    return text.substring(0, howShort) + "...";
  } else {
    return text;
  }
};
