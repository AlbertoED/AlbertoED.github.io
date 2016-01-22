    /* DECLARACION DE VARIABLES*/
    // Para referenciar a nuestra app de FireBase
    var myDataRef = new Firebase('https://shining-torch-549.firebaseio.com/');
    // Para almacenar el nombre del usuario que se ha conectado
    var nombreUsuario;
    // Variable booleana para fijar si la sesión del usuario esta abierta (1) o no (0)
    var sesion = 0; ;


    /* En esta seccion colocamos los fragmentos de codigo que queremos que se ejecuten tras cargar la pagina */
    $(document).ready(function(){
            //Codigo a ejecutar cuando se va a cargar el modal de login
            $('#myModal').on('show.bs.modal', function(e) {
                //Comprobamos si ya esta registrado, y mostramos el mensaje de info
                var authData = myDataRef.getAuth();
                if (authData) {
                    document.getElementById('usuarioInfo').innerHTML = nombreUsuario;
                    $('.alert-info ').show();
                    sesion = 1
                } else if (sesion==1){
                    //Significa que estaba conectado pero que la sesion ha expirado
                    $('.alert-warning ').show();
                    sesion = 0
                } else {
                    //No estaba conectado y ahora tampoco lo esta, no hago nada
                }
            });

            //Codigo a ejecutar cuando se ha cargado el modal de login
            $('#myModal').on('shown.bs.modal', function(e) {
                //Hacemos focus en el input de usuario una vez cargado el modal
                $('#usr').focus();
            });          

            //Codigo a ejecutar cuando se cierra el modal de login
            $('#myModal').on('hidden.bs.modal', function(e) {
                //Vaciamos los campos de input del modal
                $(this)
                    .find("input,textarea,select")
                    .val('')
                    .end()
            });

            //
            /*$("#myModal").keypress(function (e) {
                if ((e.keyCode == 13)) {
                  e.preventDefault();
                  loginUser(form);
                }
            });*/
        });




    /* Esta funcion sirve para crear un 'objeto' y una variable propia en nuestra app de FireBase*/
    function testFirebaseSet(form) {
        var usersRef = myDataRef.child("user");
        
        var username = 'GSIGITHUB';
        var password = 'GSIHUB';
        
        var userRef = usersRef.child(username);
        
        userRef.set({password: password});
    };

 /*   $('#myModal').on('show', function ()  {
        var authData = myDataRef.getAuth();
        if (authData) {
            $("#usuarioInfo").value = authData.provider;
            $('.alert-info ').show();
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
        } else {
            console.log("Entra pero error");
        }
    });
*/
            
            /*$('#myModal').on('shown.bs.modal', function () {
                setTimeout(function(){
                     console.log("Entra pero error");
                }, 100);
            });*/

    /* Esta funcion es llamada al pulsar el boton de entrar, en la ventana de Login*/
    function loginUser(form){
        /* Comprobamos si ya esta logado el usuario */
        var authData = myDataRef.getAuth();
            if (authData) {
                document.getElementById('usuarioInfo').innerHTML = authData.uid;
                $('.alert-info ').show();
                console.log("User " + authData.uid + " is logged in with " + authData.provider);
            } else {
                sesion = 0
                $('.alert').hide();
                console.log("User is logged out");          
                myDataRef.authWithPassword({
                  email    : form.userid.value,
                  password : form.pswrd.value
                }, function(error, authData) {
                    /*$('.alert').hide();*/
                  if (error) {
                    $('.alert-danger ').show();
                    console.log("Login Failed!", error);
                  } else {
                    $('.alert-success').show();
                    //Guardo el nombre del usuario en una variable global
                    nombreUsuario = form.userid.value
                    sesion = 1
                    console.log("Authenticated successfully with payload:", authData);
                  }
                },{
                remember: "sessionOnly"/* Se utiliza para marcar que la sesión expirara tras cerrar la ventana */
                });
            }
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