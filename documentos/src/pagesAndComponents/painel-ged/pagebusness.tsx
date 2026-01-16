import { useEffect } from "react";
import { api as useApi } from "../../services/api";
const PageBusnessSelected = () => {
    const { api } = useApi();
    const captureIdAndName = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('i');
        const type = urlParams.get('t');
        console.log(`Captured ID: ${id}, Name: ${type}`);

        api.get(`/v1/busnessSite/${id}/${type}`)
            .then((response) => {   
                if (response.status === 200) {
                    console.log("Data fetched successfully:", response.data);
                } else {
                    console.error("Error fetching data:", response.statusText);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    useEffect(() => {
        captureIdAndName();
    }
        , []);
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Page Business</h1>
            <p className="text-gray-600">This is the Page Business component.</p>
        </div>
    );
}


export default PageBusnessSelected;