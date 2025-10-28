import { createContext, useContext } from "react";
enum View {
  Home = 'home',
  Room = 'room',
}

export const ViewContext = createContext<{
  view: View;
  setView: (view: View) => void;
}>({
  view: View.Home,
  setView: () => {},
});

export const useViewContext = () => {
    return useContext(ViewContext);
}

export { View };