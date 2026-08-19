
async function handleForm(event){
     event.preventDefault();
     
     const data = {
         name: event.target.name.value,
         email: event.target.email.value,
         password: event.target.password.value
     };

     try{
           const response = await fetch("http://localhost:4555/api/signup", {
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