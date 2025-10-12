import axios from "axios";

const sistemaApi = axios.create({
    baseURL:"http://localhost:3000/api/home"
})
/* 
=======================================================================================================================
METODOS PARA APP "HOME" 
=======================================================================================================================
*/

export const getHome = async() =>{
    try{
        const response =await tareaApi.get("/");
        return response.data;
    } catch (error){
        console.error("Error al iniciar el sistema", error);
    }
};
