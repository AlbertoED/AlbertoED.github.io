/*** FUNCIONES RELACIONADAS CON EL LOGIN DEL ADMINISTRADOR ****/     

    /* EN ESTA SECCION SE ENCUENTRAN LOS FRAGMENTOS DE CODIGO QUE SE DEBEN EJECUTAR O ESTAR LISTOS PARA EJECUTAR UNA VEZ CARGADA LA PAGINA */
    $(document).ready(function(){
    	sessionControl();

        //Codigo a ejecutar cuando se ha cargado el modal de login
        $('#myModalLogin').on('shown.bs.modal', function(e) {
            //Hacemos focus en el input de usuario una vez cargado el modal
            $('#usr').focus();
        });          

        //Codigo a ejecutar cuando se cierra el modal de login
        $('#myModalLogin').on('hidden.bs.modal', function(e) {
            //Vaciamos los campos de input del modal
            $(this)
                .find("input,textarea,select")
                .val('')
                .end()
        });

        //Codigo a ejecutar cuando se cierra el modal de sesion expirada. Llama al index si estamos en admin
        $('#myModalSessionExpired').on('hidden.bs.modal', function(e) {
	        var rutaEntera = window.location.pathname;
        	var urlPag = rutaEntera.split("/").pop();
        	 if (urlPag == "admin.html" || urlPag == "admin"){
				location.href = "/index.html";	
			}else{
				sessionControl();
			}
        });
    });

    /* FUNCION PARA CONTROLAR LA SESION AL MOVERSE ENTRE LAS PAGINAS */
    function sessionControl() {
        //Codigo que activa controles de administrador si hay sesion iniciada
        var authData1 = myDataRef.getAuth();
        if (authData1){
            //Si esta conectado, mostramos el label con el nombre de usuario y el boton de administrador y ocultamos el del login
            document.getElementById('usuario-mail-navbar').innerHTML ="Bienvenido <b>" + authData1.password.email + "</b>";
            document.getElementById('btnAdmin').style.display = 'inline';
            document.getElementById('btnLogin').style.display = 'none';
            //Comenzamos el control de sesion
            adminSession();
        }else{
        	document.getElementById('btnLogin').style.display = 'inline';
            document.getElementById('usuario-mail-navbar').innerHTML =""
            document.getElementById('btnAdmin').style.display = 'none';
        }
    }

    /* FUNCION PARA CONTROLAR EL ACCESO A LA PAGINA DE ADMIN. REALIZADO POR SI NO SE ACCEDE A LA MISMA POR LA VENTA DE LOGIN (URL EN EL NAVEGADOR) */
    function accessAdmin() {
	        var authData = myDataRef.getAuth();
	        //Si esta logado, no hace nada y permite el paso a admin. Si no, redirecciona al index
	        if (authData){
	            console.log("Acceso permitido");
	        }else{
	            console.log("Acceso denegado");
	            location.href = "/index.html";
	        }
    };

    /* FUNCION PARA CONTROLAR SESION CUANDO SE ENCUENTRA DENTRO DE LA PAGINA DE ADMINISTRACION. SALTA CUANDO SE DETECTA UN CAMBIO EN EL ESTADO DE SESION EN FIREBASE */
    function adminSession() {
    	myDataRef.onAuth(function(authData) {
			if (authData) {
			} else {
                if (finSesionManual != true){
                    $('#myModalSessionExpired').modal();    
                } else {
                    $(".notifications .notification.finSesion.empty").addClass("active");
                    setTimeout(function() {
                        $(".notifications .notification.finSesion").removeClass("active");
                    }, 3000);  
                }
		
	 	 	}
		});  
    }

    /* FUNCION PARA COMPROBAR SI LOS CREDENCIALES PASADOS SON CORRECTOS AL HACER CLICK EN ENTRAR EN EL POPUP DE LOGIN */
    function loginUser(form) {
        /* Comprobamos si ya esta logado el usuario */
        var authData = myDataRef.getAuth();
            if (authData) {
                document.getElementById('usuarioInfo').innerHTML = authData.password.email;
                $('.alert-info ').show();
            } else {
                $('.alert').hide();
                console.log("User is logged out");          
                myDataRef.authWithPassword({
                  email    : form.userid.value,
                  password : form.pswrd.value
                }, function(error, authData) {
                  if (error) {
                    $('.alert-danger ').show();
                    console.log("Login Failed!", error);
                  } else {
                    $('.alert-success').show();
                    //Guardo el nombre del usuario en una variable global
                    nombreUsuario = form.userid.value;               
                    location.href = "/admin.html"
                  }
                },{
                remember: "sessionOnly"/* Se utiliza para marcar que la sesión expirara tras cerrar la ventana */
                });
            }
    };

    /* FUNCION PARA CERRAR LA SESION DEL USUARIO CONECTADO*/
    function logoutUser() {
    	var rutaEntera = window.location.pathname;
        var urlPag = rutaEntera.split("/").pop();
        //Dejamos de escuchar los cambios en el usuario y cerramos sesion
        finSesionManual = true;
        myDataRef.unauth();
        finSesionManual = false;
        $('.alert').hide();
        $('.alert-warning ').show();
        //Quitamos el boton de admin y el label de usuario. Devolvemos el boton de login
        document.getElementById('btnAdmin').style.display = 'none';
        document.getElementById('usuario-mail-navbar').innerHTML = ""
        document.getElementById('btnLogin').style.display = 'inline';
        //Debemos comprobar en que pagina se encuentra el usuario
        //Si estamos en admin redireccionamos al index
        if (urlPag == "admin.html") {
            location.href = "/index.html";
        };  
    };