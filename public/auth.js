
function handleForm(event){
     event.preventDefault();
     
     const datas = {
         name: event.target.name.value,
         emai: event.target.email.value,
         password: event.target.password.value
     };

     console.log(datas);
     event.target.reset();
}