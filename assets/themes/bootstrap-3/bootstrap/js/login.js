    /* DECLARACION DE VARIABLES*/
    // Para referenciar a nuestra app de FireBase
    var myDataRef = new Firebase('https://shining-torch-549.firebaseio.com/');
    // Para almacenar el nombre del usuario que se ha conectado
    var nombreUsuario;
    // Variable booleana para fijar si la sesión del usuario esta abierta (1) o no (0)
    var sesion = 0;


    /* En esta seccion colocamos los fragmentos de codigo que queremos que se ejecuten tras cargar la pagina */
    $(document).ready(function(){
            
            //Codigo que activa controles de administrador si hay sesion iniciada
            var authData1 = myDataRef.getAuth();
            if (authData1){
                //Si esta conectado, mostramos el label con el nombre de usuario y el boton de administrador
                document.getElementById('usuario-mail-navbar').innerHTML ="Bienvenido <b>" + authData1.password.email + "</b>";
                document.getElementById('btnAdmin').style.display = 'inline';
            }

            //Codigo a ejecutar cuando se va a cargar el modal de login
            $('#myModal').on('show.bs.modal', function(e) {
                //Comprobamos si ya esta registrado, y mostramos el mensaje de info
                var authData = myDataRef.getAuth();
                if (authData) {
                    document.getElementById('usuarioInfo').innerHTML = authData.password.email;
                    document.getElementById('btnFinSesion').style.display = 'inline';
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
                //Comprobamos si ha expirado sesion y estamos en pagina admin
                comprobarPagAdmin();
            });

            //
            /*$("#myModal").keypress(function (e) {
                if ((e.keyCode == 13)) {
                  e.preventDefault();
                  loginUser(form);
                }
            });*/
        });

    function mostrarLogin() {
        $('#myModal').modal('show');  
        console.log("entra")
    };

    /* Funcion para controlar acceso a la pagina admin segun sesion. Realizado por si no se accede a la misma por la venta de login (url en buscador) */
    function accesoAdmin() {
            console.log(sesion);
            var authData = myDataRef.getAuth();
            if (authData){
                console.log("La sesion esta iniciada, muestro admin");
                sesion = 1;
                console.log(authData.password.email);
            }else{
                console.log("La sesion no esta iniciada:");
                sesion = 0;
                location.href = "/index.html";
                //mostrarLogin();
            }
    };

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
                document.getElementById('usuarioInfo').innerHTML = authData.password.email;
                $('.alert-info ').show();
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
                    nombreUsuario = form.userid.value;
                    //Genero una espera para realizar peticion a GitHub de todos los proyectos y guardarlos en un json
                    // PENDIENTE
                    //Redirijo a la pagina de admin.html la una espera. El hilo de ejecucion continua, y ejecuta esta accion a los X segundos
                    //document.getElementById('loadLogin').style.display = 'inline';
                    //setTimeout(function(){location.href = "/admin.html";},5000);
                    sesion = 1 ;                  
                    console.log("Authenticated successfully with payload:", authData);
                    location.href = "/admin.html"
                  }
                },{
                remember: "sessionOnly"/* Se utiliza para marcar que la sesión expirara tras cerrar la ventana */
                });
            }
    };

    /* Esta función se utiliza para comprobar al cerrar el popup de login si la pagina en la que estamos es 'admin' en cuyo caso comprueba si hay sesion para continuar*/
    function comprobarPagAdmin() {
        var rutaEntera = window.location.pathname;
        var urlPag = rutaEntera.split("/").pop();
        if (urlPag == "admin.html") {
            accesoAdmin()
            console.log("Ha comprobado si hay sesion, y si hay")
        }else{
            console.log("No estamos en admin")
            //Este caso significa que no estamos en la pagina de admin, pero debemos comprobar si sigue habiendo sesion
            var authData = myDataRef.getAuth();
            if (authData){
                // Si tenemos sesion no hacemos nada
            }else{
                // Si no tenemos, eliminamos componentes de administrador
                console.log("La sesion no esta iniciada:");
                sesion = 0;
                //Quitamos el boton de admin y el label de usuario
                document.getElementById('btnAdmin').style.display = 'none';
                document.getElementById('usuario-mail-navbar').innerHTML = ""

                //mostrarLogin();
            }
        }
    };

    /* Esta función se utiliza para cerrar la sesion del usuario conectado*/
    function cerrarSesion() {
            myDataRef.unauth();
            sesion = 0
            $('.alert').hide();
            $('.alert-warning ').show();
    };

    /* Funcion llamada al cerrar la sesion desde el navbar */
        function cerrarSesionNavbar() {
            cerrarSesion();
            //Debemos comprobar en qúe pagina se encuentra el usuario
            comprobarPagAdmin();
    };
