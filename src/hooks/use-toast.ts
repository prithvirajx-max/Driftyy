export function useToast() {
  return {
    toast: (options: { title: string; description?: string }) => {
      console.log("Toast:", options.title, options.description);
      alert(`${options.title}\n${options.description || ""}`);
    },
  };
}
