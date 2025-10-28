import {  useState } from "react";
import {View, ViewContext} from "./view.context";



export const ViewProvider = ({ children }: { children: React.ReactNode }) => {
    const [view, setView] = useState<View>(View.Home);

    return (
        <ViewContext.Provider value={{ view, setView }}>
            {children}
        </ViewContext.Provider>
    );
};


