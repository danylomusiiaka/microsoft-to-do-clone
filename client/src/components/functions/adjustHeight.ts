export const adjustHeight = (refArea: React.RefObject<HTMLTextAreaElement | null>) => {
  const area = refArea.current;
  if (area) {
    area.style.height = "50px";
    area.style.height = `${area.scrollHeight}px`;
  }
};
