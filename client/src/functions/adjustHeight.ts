export const adjustHeight = (refArea: React.RefObject<HTMLTextAreaElement | null>, initialValue?: string) => {
  const area = refArea.current;
  if (area) {
    area.style.height = initialValue || "45px";
    area.style.height = `${area.scrollHeight}px`;
  }
};
