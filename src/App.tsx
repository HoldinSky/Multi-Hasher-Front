import {Route, Routes} from "react-router-dom";
import {FC} from "react";
import Homepage from "./Components/Homepage";
import NavigationBar from "./Components/NavigationBar";
import Hashing from "./Components/Hashing";
import HashDetails from "./Components/HashDetails";
import {createTheme, ThemeProvider} from "@mui/material";


const App: FC = () => {
    const theme = createTheme({
        typography: {
            fontFamily: [
                '"Roboto Mono"',
                "sans-serif",
            ].join(","),
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <NavigationBar/>
            <div className="">
                <Routes>
                    <Route path="/" element={<Homepage/>}/>
                    <Route path="/hashing" element={<Hashing/>}/>
                    <Route path="/details" element={<HashDetails/>}/>
                </Routes>
            </div>
        </ThemeProvider>
    );
}

export default App;