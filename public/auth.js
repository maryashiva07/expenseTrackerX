
const API_URL = "/api";

async function handleForm(event){
     event.preventDefault();
     
     const data = {
         name: event.target.name.value,
         email: event.target.email.value,
         password: event.target.password.value
     };

     try{
           const response = await fetch(`${API_URL}/signup`, {
          method: "POST",
          headers: {
             "Content-Type" : "application/json"
          },
          body: JSON.stringify(data)
     });

     const result = await response.json();
      console.log(result);

      if(response.ok){
         alert(result.message);
         event.target.reset();

         window.location.href = "login.html";
      }
      else{
            alert(result.message);
      }

     }
     catch(err){
         console.log(err);
         alert("Server error", err);
     }
     
}


async function loginHandler(event){
    event.preventDefault();
    
     const data = {
           email: event.target.email.value,
           password: event.target.password.value
     };

     try{
           const response = await fetch(`${API_URL}/login`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(data)
           });

           const result = await response.json();
           console.log(result);

           if(!response.ok){
                alert(result.message || "Login failed");
                return;
           }
           else{
                  alert("User login Successfull!");
                  event.target.reset();
                  window.location.href = "expense.html";
           }

            // Store JWT
            localStorage.setItem(
                "token",
                result.token
            );


            // Store user information
            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );


            // Go to dashboard
            // window.location.href = "index.html";


        } catch (error) {

            console.error(error);

            alert("Server error. Please try again.");

        }
       
}