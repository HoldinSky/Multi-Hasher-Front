import {FC, useEffect} from "react";
import {Box} from "@mui/material";
import {Link} from "react-router-dom";


const Homepage:FC = () => {
    useEffect(() => {
        document.title = "Multi-Hasher 3000";
    })

    return <>
        <Box
            component={"div"}
            display={"grid"}
            justifyContent={"center"}
        >
            <p>Welcome on the best hash utility You could ever found! Multi-Hasher 3000!!!</p>
            <p style={{display: 'grid', justifyContent: 'center'}}><Link to={"/hashing"}>Go to hashing!</Link></p>
        </Box>
    </>
}

export default Homepage;