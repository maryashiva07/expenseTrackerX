const API_URL = "/api";

const form = document.getElementById("forgotPasswordForm");
const message = document.getElementById("message");

form.addEventListener("submit", async(event)=>{
     event.preventDefault();

     const email = document.getElementById("email").value.trim();

     try{
            const response = await axios.post(`${API_URL}/password/forgotpassword`,{
                  email: email
            });

            message.textContent = response.data.message;

            form.reset();
     }
     catch(err){
         console.log(err);

         message.textContent = err.response?.data?.message||"Something went wrong";
     }
});