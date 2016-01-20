    /* Declaramos la variables para referenciar a nuestra app de FireBase*/
    var myDataRef = new Firebase('https://shining-torch-549.firebaseio.com/');

    /* Esta funcion sirve para crear un 'objeto' y una variable propia en nuestra app de FireBase*/
    function testFirebaseSet(form) {
        var usersRef = myDataRef.child("user");
        
        var username = 'GSIGITHUB';
        var password = 'GSIHUB';
        
        var userRef = usersRef.child(username);
        
        userRef.set({password: password});
    };

    /* Esta funcion es llamada al pulsar el boton de entrar, en la ventana de Login*/
    function loginUser(form){
        myDataRef.authWithPassword({
          email    : form.userid.value,
          password : form.pswrd.value
        }, function(error, authData) {
            $('.alert').hide();
          if (error) {
            $('.alert-danger ').show();
            console.log("Login Failed!", error);
          } else {
            $('.alert-success').show();
            console.log("Authenticated successfully with payload:", authData);
          }
        },{
        remember: "sessionOnly"/* Se utiliza para marcar que la sesión expirara tras cerrar la ventana */
        });
    };

            function check(form) { /*function to check userid & password*/
                /*the following code checkes whether the entered userid and password are matching*/
                if(form.userid.value == "Alberto" && form.pswrd.value == "Alberto") {
                    window.location.href ='Repositorios.html'/*opens the target page while Id & password matches*/
                }
                else {
                    alert("Error Password or Username")/*displays error message*/
                }
            }


function showAlert(){
  $("#myAlert").addClass("in")
}