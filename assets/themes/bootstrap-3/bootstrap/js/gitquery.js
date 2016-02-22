    // Para referenciar a nuestra app de FireBase
    var nameBBDD = 'https://shining-torch-549.firebaseio.com/'
    var myDataRef = new Firebase(nameBBDD);
    var cuentaGit = "gsi-upm"; 
    var tokenGit;
    var currentPage = 1;
    var loadingProjects = true;
    var stopLoadingProjects = false;
    // Variable publica para almacenar los repositorios devueltos por github
    var repos;
    //Variable array para guardar los repositorios eliminados de github y poder eliminarlos de Firebase desde otra función
    var arrayReposEliminados = new Array();
    //Variable booleana para controlar si estamos aplicando un filtro de búsqueda
    var isFilter = false;

    /* FUNCION PARA CARGAR LOS REPOSITORIOS EN LA PAGINA DE ADMIN */
    jQuery.fn.cargaRepositoriosGithub = function () {
        if (loadingProjects || stopLoadingProjects){
            return;
        }
        var description;
        var fechaIn;
        var privacidad;
        var target = this;
        loadingProjects = true;
        $.gitUser(function (data) {
        repos = data.data; // JSON Parsing
                /*var reposRef = myDataRef.child("repos");
                reposRef.set(repos);*/
                console.log(repos.length);
                // Comprobamos si la peticion ya no devuelve mas objetos y en ese caso ya no se envían mas peticiones a github
                // y se termina el infinite scroll
                if (repos.length == 0){
                    $('#load-more').remove();
                    stopLoadingProjects = true;
                    return;
                }
                //sortByForks(repos); //Sorting by forks. You can customize it according to your needs.
                var node = $('#display-projects');
                $(repos).each(function () {
                    var IDRepo = this.id;
                    checkfork = this.fork;
                    if (this.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                        //Comprobamos si tiene descripcion:
                        if (this.description == ''){
                            description = '-';
                        }else{
                            description = this.description;
                        }
                        //Recogemos la fecha y la ponemos en formato correcto
                        fechaIn = stringDate(this.created_at.substring(0,10));
                        //Comprobamos si es público o privado
                        if (this.private == true){
                            privacidad = "PRIVADO";
                        }else{
                            privacidad = "PÚBLICO";
                        }
                        //Las columnas deben sumar 12. Anidamos los contenedores para cada proyecto que nos devuelva el GET:
                        $('<div class="panel panel-primary"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin"><a href="' + this.html_url + '" target="_blank">' + this.name + '</a></p></div>' +
                        '<div class="panel-body"><div class="row"><div class="col-md-2"><p><b>Autor: </b>'+ this.owner.login + '</p></div>' + 
                        '<div class="col-md-3"><p><b>Fecha Creación: </b>'+ fechaIn + '</p></div>' +
                        '<div class="col-md-5"><p><b>Categoría: </b><select id="select' + this.id + '"><option hidden value="0">Seleccione una categoría</option><option value="1">Agentes y Simulación Social</option><option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option></select></p></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Descripción: </b>' + description + '</div>' +
                        '<div class="col-md-2"><b>Perfil: </b>' + privacidad + '</div></div></div>').hide().appendTo(node).fadeIn(1000);
                        //Incluimos efecto de fade in para los nuevos repositoios que se muestran
                        //Comprobamos si ya hay datos guardados en Firebase para cada repositorio
                        myDataRef.once("value", function(snapshot) {
                            var elementFirebase = snapshot.child("repos/" + IDRepo).exists();
                            console.log(IDRepo + " en firebase: " + elementFirebase);
                            //Si está en Firebase, recuperamos el valor del select y del toggle y los asignamos al panel del repositorio
                            if (elementFirebase == true){
                                refTemp = new Firebase(nameBBDD +   'repos/' + IDRepo);
                                refTemp.on("value", function(snapshot) {
                                        var reposFire = snapshot.val();
                                        var toggleValue = reposFire.show;
                                        var selectValue = reposFire.category
                                        console.log(IDRepo + " " + toggleValue + " " + selectValue);
                                        $("#select" + IDRepo).val(selectValue);
                                        if (toggleValue == true){
                                            $("#toggle" + IDRepo).bootstrapToggle('on');    
                                        }else{
                                            $("#toggle" + IDRepo).bootstrapToggle('off');
                                        }                                                                                 
                                });
                            }
                        });
                    }
                });
                //CUANDO TERMINE DE CARGAR LOS REPOSITORIOS EL NAVBAR DE CONTROL SERÁ VISIBLE, SI NO ES FILTRO
                //$('#navbarControl').hide().fadeIn(500);
                $('#btnGuardarRepositorios-abajo').show();
                //IMPORTANTE: esta linea transforma todos los checkboxes que hemos añadido al html en los toggles
                $('input[type="checkbox"]').bootstrapToggle({
                        on: 'Sí',
                        off: 'No'
                });
                //...
                loadingProjects = false;
                $('#fecha-actualizacion').hide().html('Fecha de actualización: <b>' + getActualDatetime() + '</b>').fadeIn(1000);
                        $('#container-main').removeClass("loading");
        });
    };

    /* FUNCION QUE TOMA COMO PARAMETRO DE ENTRADA UNA STRING DE FECHA (10) Y LO DEVUELVE EN OTRO FORMATO */
    function stringDate(date) {
        return (date.substring(8,10) + '-' + date.substring(5,7) + '-' + date.substring(0,4));
    }; 

    /* FUNCION QUE TOMA COMO PARAMETRO DE ENTRADA UNA STRING DE FECHA (10) Y LO DEVUELVE EN OTRO FORMATO */
    function getActualDatetime() {
        var stringDate;
        var currentTime = new Date();
        var month = (currentTime.getMonth() + 1);
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();

        if (minutes < 10){
            minutes = ("0" + minutes);
        }

        var actualDate = (day + "/" + month + "/" + year + " " + hours + ":" + minutes + " ");
        console.log(actualDate);
        return actualDate;
    }; 

    /* FUNCION PARA RECUPERAR EL TOKEN DE GITHUB ALOJADO EN FIREBASE */
    function getTokenFireBase() {
        refTemp = new Firebase(nameBBDD + 'Tokens');
        refTemp.on("value", function(snapshot) {
                var tokens = snapshot.val();
                $(tokens).each(function () {
                    if (this.user == cuentaGit){
                        tokenGit = this.token;
                        loadingProjects = false;
                        $("#display-projects").cargaRepositoriosGithub();
                        //return tokenGit;
                    }
                });
        });
    };

    /* FUNCION PARA QUITAR FILTROS Y VER TODOS REPOSITORIOS */
    function verTodos(){
        stopLoadingProjects = false;
        loadingProjects = false;
        currentPage = 1;
        if (isFilter == true){
            document.getElementById("display-projects").innerHTML="";
            $("#display-projects").cargaRepositoriosGithub();
        }
        isFilter = false;
        $('#srch-control-navbar').val("");
    };

    /* FUNCION PARA FILTRAR.  */
    function filtrarRepositorios(){
        var filterFound = false;
        //Comprobamos si se ha introducido algun filtro:
        if ($('#srch-control-navbar').val() != ''){
            isFilter = true;
            console.log("HAYFILTRO");
            var filter = $('#srch-control-navbar').val().toUpperCase();
            console.log(filter);
            jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?&access_token=' + tokenGit + '&callback=?', function(responseRepoInfo) {            
                console.log(repos.length);
                //sortByForks(repos); //Sorting by forks. You can customize it according to your needs.
                document.getElementById("display-projects").innerHTML="";
                var node = $('#display-projects');
                $(repos).each(function () {
                    //Si el nombre o el id del proyecto no cuadran con el filtro continuamos con el siguiente proyecto y este no lo mostramos
                    if (((this.name).toUpperCase().indexOf(filter) == -1) && (String((this.id)).indexOf(filter) == -1)){
                        return;
                    }
                    //Si llega a este punto significa que ha encontrado algún repositorio que cuadre con el filtro
                    filterFound = true;
                    var IDRepo = this.id;
                    checkfork = this.fork;
                    if (this.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                        //Comprobamos si tiene descripcion:
                        if (this.description == ''){
                            description = '-';
                        }else{
                            description = this.description;
                        }
                        //Recogemos la fecha y la ponemos en formato correcto
                        fechaIn = stringDate(this.created_at.substring(0,10));
                        //Comprobamos si es público o privado
                        if (this.private == true){
                            privacidad = "PRIVADO";
                        }else{
                            privacidad = "PÚBLICO";
                        }
                        //Las columnas deben sumar 12. Anidamos los contenedores para cada proyecto que nos devuelva el GET:
                        $('<div class="panel panel-primary"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin"><a href="' + this.html_url + '" target="_blank">' + this.name + '</a></p></div>' +
                        '<div class="panel-body"><div class="row"><div class="col-md-2"><p><b>Autor: </b>'+ this.owner.login + '</p></div>' + 
                        '<div class="col-md-3"><p><b>Fecha Creación: </b>'+ fechaIn + '</p></div>' +
                        '<div class="col-md-5"><p><b>Categoría: </b><select id="select' + this.id + '"><option hidden value="0">Seleccione una categoría</option><option value="1">Agentes y Simulación Social</option><option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option></select></p></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Descripción: </b>' + description + '</div>' +
                        '<div class="col-md-2"><b>Perfil: </b>' + privacidad + '</div></div></div>').hide().appendTo(node).fadeIn(1000);
                        //Incluimos efecto de fade in para los nuevos repositoios que se muestran
                        //Comprobamos si ya hay datos guardados en Firebase para cada repositorio
                        myDataRef.once("value", function(snapshot) {
                            var elementFirebase = snapshot.child("repos/" + IDRepo).exists();
                            console.log(IDRepo + " en firebase: " + elementFirebase);
                            //Si está en Firebase, recuperamos el valor del select y del toggle y los asignamos al panel del repositorio
                            if (elementFirebase == true){
                                refTemp = new Firebase(nameBBDD +   'repos/' + IDRepo);
                                refTemp.on("value", function(snapshot) {
                                        var reposFire = snapshot.val();
                                        var toggleValue = reposFire.show;
                                        var selectValue = reposFire.category
                                        console.log(IDRepo + " " + toggleValue + " " + selectValue);
                                        $("#select" + IDRepo).val(selectValue);
                                        if (toggleValue == true){
                                            $("#toggle" + IDRepo).bootstrapToggle('on');    
                                        }else{
                                            $("#toggle" + IDRepo).bootstrapToggle('off');
                                        }                                                                                 
                                });
                            }
                        });
                    }
                });
                //CUANDO TERMINE DE CARGAR LOS REPOSITORIOS EL NAVBAR DE CONTROL SERÁ VISIBLE, SI NO ES FILTRO
                //$('#navbarControl').hide().fadeIn(500);
                $('#btnGuardarRepositorios-abajo').show();
                //IMPORTANTE: esta linea transforma todos los checkboxes que hemos añadido al html en los toggles
                $('input[type="checkbox"]').bootstrapToggle({
                        on: 'Sí',
                        off: 'No'
                });
                //...
                loadingProjects = false;
                $('#fecha-actualizacion').hide().html('Fecha de actualización: <b>' + getActualDatetime() + '</b>').fadeIn(1000);
                $('#container-main').removeClass("loading");
                stopLoadingProjects = true;
                //Si llega al final y no hay ningún repositorio que coincida con la busqueda, se notifica
                if(filterFound == false){
                    $("<h3 class='noRepos'>Ningún repositorio coincide con la búsqueda<h3>").hide().appendTo($("#display-projects")).fadeIn(1000);
                }
            });
        }
    };

    /* FUNCION PARA GUARDAR LOS REPOSITORIOS EN FIREBASE */
    function guardarSeleccion(){
        //Cerramos el modal
        $('#confirmar-guardar').modal('hide');
        $('#container-main').addClass("loading");
        var reposRef = myDataRef.child("repos");
        var nOK = 0;
        var nTotal = $(".titleReposAdmin").length;
        //Para cada proyecto mostrado en pantalla guardamos la información en Firebase
        //Realiza tres peticiones a GitHub por proyecto
        //1) - Información general del proyecto
        //2) - El contenido del Readme
        //3) - Los colaboradores del proyecto
        // Buscamos todos los paneles existentes (1 panel= 1 repositorio). De cada uno realizamos una petición de info a GitHub.
        // Guardamos los datos que queremos mostrar posteriormente y la categoria y 'mostrar' especificados
        //tamaño en KB
        $(".titleReposAdmin").each(function(){
            var nameRepo = $(this).text();
            console.log(nameRepo);
            nOK++;
                //1) - GitRepoInfo
                jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '?&access_token=' + tokenGit + '&callback=?', function(responseRepoInfo) {            
                    //2) - GitReadme
                    jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/readme?access_token=' + tokenGit + '&callback=?', function(responseReadme) {  
                        //3) - GitCollaborators
                        jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/collaborators?access_token=' + tokenGit + '&callback=?', function(reponseCollaborators) {            
                            //Recorremos la respuesta y guardamos el nombre de cada colaborador en un array
                            var collaborators = reponseCollaborators.data;
                            var collaboratorsRepo = new Array();
                            var i = 0;
                            $(collaborators).each(function() {
                                collaboratorsRepo[i] = this.login;
                                i++;
                            });
                            //Recogemos el valor del 'select' de categoria y del 'toggle' de mostrar
                            var idS = "#select" + responseRepoInfo.data.id;
                            var categoryRepo = $(idS).prop('value');
                            var idT = "#toggle" + responseRepoInfo.data.id;
                            var showRepo = $(idT).prop('checked');
                            console.log(responseRepoInfo.data.name + "  - " + collaboratorsRepo[0] + " - " + categoryRepo + " - " + showRepo);
                            //Comprobamos si se ha devuelto readme del proyecto.
                            if (responseReadme.data.content == undefined){
                                var Readme = "-";
                                var codeReadme = "-";
                            }else{
                                var Readme = responseReadme.data.content;
                                //Compruebo si el fichero README está en Markdown o RDoc. Tomo string a partir del punto
                                var subReadme = responseReadme.data.name.substr(responseReadme.data.name.indexOf(".") + 1);                              
                                switch(subReadme) {
                                    case "rdoc":
                                        var codeReadme = "rundown";
                                        break;
                                    case "txt":
                                        var codeReadme = "txt";
                                        break;
                                    default:
                                        var codeReadme = "showdown";     
                                }
                            }
                            //Comprobamos si tiene descripcion:
                            if (responseRepoInfo.data.description == ''){
                                var description = '-';
                            }else{
                                var description = responseRepoInfo.data.description;
                            }

                            reposRef.child(responseRepoInfo.data.id).set({
                                id: responseRepoInfo.data.id,
                                name: responseRepoInfo.data.name,
                                owner: responseRepoInfo.data.owner.login,
                                html_url: responseRepoInfo.data.html_url,
                                description: description,
                                created_at: responseRepoInfo.data.created_at,
                                updated_at: responseRepoInfo.data.updated_at,
                                size: responseRepoInfo.data.size,
                                readme: Readme,
                                codeReadme: codeReadme,
                                category: categoryRepo,
                                show: showRepo,
                                language: responseRepoInfo.data.language,
                                collaborators: collaboratorsRepo,
                                private: responseRepoInfo.data.private,
                                download_zip_url: "https://github.com/" + cuentaGit + "/" + responseRepoInfo.data.name + "/archive/" + responseRepoInfo.data.default_branch + ".zip"
                            });
                            if( nOK == nTotal ) {
                               $('#container-main').removeClass("loading");
                                $(".notifications .notification.guardado.ok").addClass("active");
                                setTimeout(function() {
                                    $(".notifications .notification.guardado").removeClass("active");
                                }, 3000);  
                            }              
                        });                    
                    });
                });              
            });
        };
        /* MOSTRAR LOS MIEMBROS DE LA ORGANIZACION
        https://api.github.com/orgs/gsi-upm/members?&access_token=...
        https://api.github.com/orgs/gsi-upm/members?&access_token=...&page=2 
    
        MOSTRAR INFO DE LA ORG
        https://api.github.com/orgs/gsi-upm?&access_token=...
        
        MOSTRAR LOS EQUIPOS
        https://api.github.com/orgs/gsi-upm/teams?&access_token=...
         */

    /* FUNCION PARA ACTUALIZAR LOS DATOS DE LOS REPOSITORIOS EN FIREBASE. SI ALGUNO NO ESTÁ EN FIREBASE SE AÑADE */
    function actualizarRepos() {
        //Cerramos el modal
        $('#confirmar-actualizar').modal('hide');
        $('#container-main').addClass("loading");
        var reposRef = myDataRef.child("repos")
        jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseRepos){
        repos = responseRepos.data; // JSON Parsing

            var nOK = 0;
            var nTotal = $(repos).length;
            $(repos).each(function () {
                var nameRepo = this.name;
                //Recuperamos  la info de Github de la misma forma que al guardar pero si introducir datos en la categoria y mostrar
                jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '?&access_token=' + tokenGit + '&callback=?', function(responseRepoInfo) {            
                    var IDRepo = responseRepoInfo.data.id;
                    myDataRef.on("value", function(snapshot) {
                        var elementFirebase = snapshot.child("repos/" + IDRepo).exists();
                        //Si está en Firebase, actualizamos los datos
                        if (elementFirebase == true){
                            var description;
                            var fechaIn;
                            var privacidad;
                            checkfork = responseRepoInfo.data.fork;
                            if (responseRepoInfo.data.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                                //Comprobamos si tiene descripcion:
                                if (responseRepoInfo.data.description == ''){
                                    description = '-';
                                } else {
                                    description = responseRepoInfo.data.description;
                                }
                                //Recogemos la fecha y la ponemos en formato correcto
                                fechaIn = stringDate(responseRepoInfo.data.created_at.substring(0,10));
                                //Comprobamos si es público o privado
                                if (responseRepoInfo.data.private == true){
                                    privacidad = "PRIVADO";
                                }else{
                                    privacidad = "PÚBLICO";
                                }                              
                                jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/readme?access_token=' + tokenGit + '&callback=?', function(responseReadme) {  
                                    jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/collaborators?access_token=' + tokenGit + '&callback=?', function(reponseCollaborators) {            
                                        //Recorremos la respuesta y guardamos el nombre de cada colaborador en un array
                                        var collaborators = reponseCollaborators.data;
                                        var collaboratorsRepo = new Array();
                                        var i = 0;
                                        $(collaborators).each(function() {
                                            collaboratorsRepo[i] = this.login;
                                            i++;
                                        });
                                        //Comprobamos si se ha devuelto readme del proyecto.
                                        if (responseReadme.data.content == undefined){
                                            var Readme = "-";
                                        }else{
                                            var Readme = responseReadme.data.content;
                                        }
                                        reposRef.child(responseRepoInfo.data.id).update({
                                            id: responseRepoInfo.data.id,
                                            name: responseRepoInfo.data.name,
                                            owner: responseRepoInfo.data.owner.login,
                                            html_url: responseRepoInfo.data.html_url,
                                            description: responseRepoInfo.data.description,
                                            created_at: responseRepoInfo.data.created_at,
                                            updated_at: responseRepoInfo.data.updated_at,
                                            size: responseRepoInfo.data.size,
                                            readme: Readme,
                                            language: responseRepoInfo.data.language,
                                            collaborators: collaboratorsRepo,
                                            private: responseRepoInfo.data.private,
                                            download_zip_url: "https://github.com/" + cuentaGit + "/" + responseRepoInfo.data.name + "/archive/" + responseRepoInfo.data.default_branch + ".zip"
                                        });   
                                        console.log("Actualizado" + responseRepoInfo.data.name);

                                        nOK++;
                                        if( nOK == nTotal ) {
                                           $('#container-main').removeClass("loading");

                                            $(".notifications .notification.actualizado.ok").addClass("active");
                                            setTimeout(function() {
                                                $(".notifications .notification.actualizado").removeClass("active");
                                            }, 3000);  
                                        }

                                    });                    
                                });  
                            }                             
                        } else {
                            nOK++;
                        }
                    });
                }); 
            });
            
        });
    };

    /* FUNCION PARA COMPROBAR SI ALGUN REPOSITORIO GUARDADO HA SIDO ELIMINADO */
    function checkReposEliminados() {
        $('#container-main').addClass("loading");
        var refTemp = new Firebase(nameBBDD + 'repos');
        var arrayReposGit = new Array();
        var node = $('#display-deleted-repos');
        var boolHayEliminados = false;
        //Vacio el nodo
        node.empty();
        //Guardo en un array los ids de los repositorios actuales en github
        jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseRepos){
            var repos = responseRepos.data; // JSON Parsing
            var i = 0;
            var j = 0;
            $(repos).each(function () {
                arrayReposGit[i] = this.id;
                i++;
            });
            //Recojo los ids que tenemos en Firebase. Si alguno no se encuentra entre los de github, significa que se ha borrado
            refTemp.on("value", function(snapshot) {
                 snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var idRepo = childData.id;
                    var nameRepo = childData.name;
                    var bool = false;
                    //Para cada repositorio compruebo que se encuentre entre los de github, si no lo añado a un array
                    for (var p = 0; (p <= arrayReposGit.length - 1); p++) {
                        console.log("entra");
                        if (arrayReposGit[p] == idRepo){
                            bool = true;
                            break;
                        }
                    };
                    //Si bool = false el repositorio se ha eliminado de GitHub y lo mostramos en el modal de eliminar
                    if (bool == false){
                        boolHayEliminados = true;
                        $('<div class="row deleted"><div class="col-md-6"><p><b>Nombre: </b>'+ nameRepo + '</p></div>' + 
                        '<div class="col-md-6"><p><b>Id: </b>'+ idRepo + '</p></div>').appendTo(node);
                        arrayReposEliminados[j] = idRepo;
                        j++;
                    }
                });
                //Por último mostramos el modal aun dentro del callback y si no hay eliminados lo informamos
                if (boolHayEliminados == false){
                    $('<p class="align-center"><b>Todos permanecen en GitHub</b></p>').appendTo(node);
                }
            });
        $('#container-main').removeClass("loading");
        $('#confirmar-eliminar').modal('show');
        });
    };

    /* FUNCION PARA ELIMINAR LOS REPOSITORIOS QUE ESTAN EN FIREBASE PERO HAN SIDO ELIMINADOS DE GITHUB */
    function eliminarRepos() {
        //Recorremos el bucle de repositorios que ya no estan en github y los eliminamos de firebase
        for (var p = 0; (p <= arrayReposEliminados.length - 1); p++) {
            var childRepo = new Firebase(nameBBDD + 'repos/' + arrayReposEliminados[p]);
            childRepo.remove();
        };
        $('#confirmar-eliminar').modal('hide');
        if (arrayReposEliminados.length != 0){
            $(".notifications .notification.eliminado.ok").addClass("active");
            setTimeout(function() {
                $(".notifications .notification.eliminado").removeClass("active");
            }, 3000);  
        }else{
            $(".notifications .notification.eliminado.empty").addClass("active");
            setTimeout(function() {
                $(".notifications .notification.eliminado").removeClass("active");
            }, 3000); 
        }

    };

    /* FUNCION PARA PEDIR LOS REPOSITORIOS DE UN USUARIO */
    jQuery.gitUser = function (callback) {
        jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=9&access_token=' + tokenGit + '&page=' + currentPage + '&callback=?', callback);
        console.log('https://api.github.com/users/' + cuentaGit + '/repos?per_page=9&access_token=' + tokenGit + '&page=' + currentPage);
    };

    /* FUNCION PARA PEDIR EL README DEL PROYECTO */
    jQuery.gitReadme = function(repositorio,callback) {
        jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + repositorio + '/readme?access_token=' + tokenGit + '&callback=?', callback);
    };

    /* FUNCION PARA PEDIR INFO DE UN REPOSITORIO */
    jQuery.gitRepoInfo = function(repositorio,callback) {
        jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '?&access_token=' + tokenGit + '&callback=?', callback);
    };

    function sortByForks(repos) {
        repos.sort(function (a, b) {
            return b.forks - a.forks; //Descending order for number of forks based sorting.
        });
    };

    /* CODIGO QUE SE EJECUTA CUANDO YA SE HA CARGADO LA PÁGINA */
    $(window).load(function(){
        var rutaEntera = window.location.pathname;
        var urlPag = rutaEntera.split("/").pop();
        if (urlPag == "archive.html" || urlPag == "archive"){
            $('#container-main').addClass("loading");
            getTokenFireBase();    
        }       
        $(window).scroll(function(){
            //Para el infinite scroll
            $('#load-more').each(function(){
                if (loadingProjects){
                    return;
                }
                var loadMoreElem = $('#load-more');
                var loadMoreOffset = loadMoreElem.offset().top;
                var windowHeight = $(window).height();
                var scrollTop = $(window).scrollTop();
                if( (loadMoreOffset) - ( scrollTop + windowHeight ) < 0 ){
                    loadMore();
                }
            });

            //Para el boton subir
            if ($(this).scrollTop() > 200) {
                $('.go-top').fadeIn(200);
            } else {
                $('.go-top').fadeOut(200);
            }
        });

        //Animacion subir
        $('.go-top').click(function(event) {
            event.preventDefault();
            $('html, body').animate({scrollTop: 0}, 300);
        })
    });

    /* FUNCION PARA DECODIFICAR EL README QUE ESTA CODIFICADO EN Base64 */
    function decodeBase64(string) {
         return decodeURIComponent(escape(window.atob(string)));   
    };
    
    /* FUNCION PARA MOSTRAR TANTOS PROYECTOS COMO QUEPAN EN LA PANTALLA */
    function loadMore() {
        console.log("entra click");
        currentPage++;
        $("#display-projects").cargaRepositoriosGithub();
    };

    /* FUNCIONES PARA RELLENAR INFO DE LOS REPOSITORIOS EN LA VISUALIZACIÓN */
    /* PRUEBA GET CATEGORIAS */ 
    function showReposCategory(categoryParam,idShowDiv) {
        $('#container-main').addClass("loading");
        node = $(idShowDiv);
        console.log(idShowDiv);
        //Según el parámetro de 
        var tempRef = new Firebase(nameBBDD + "Categories").orderByChild('name').equalTo(categoryParam).once("child_added", function(snapshot) {
           var reposCategory = snapshot.val();
           console.log(reposCategory);
           var category = reposCategory.id;
           //Solo devuelve un objeto con el id de la categoria y lo usamos para recuperar los repos de la categoria
           console.log(category);
            var tempRefCat = new Firebase(nameBBDD + "repos").orderByChild('category').equalTo(String(category)).on("value", function(repositories){
                repositories.forEach(function(repo) {
                    var infoRepo = repo.val();
                    if (infoRepo.show == false){
                        return;
                    }
                    //Compruebo si tiene README y la codificación para aplicarle un conversor de RDOC u otro de MARKDOWN
                    //Showdown para markdown y rundown para rdoc. Txt con las etiquetas pre
                    if (infoRepo.readme == "-"){
                        var decodedReadme = "<h3 class='noReadme'>Repositorio sin archivo Readme<h3>"
                    }else{
                        switch(infoRepo.codeReadme) {
                            case "showdown":
                                var converter = new showdown.Converter();
                                var decodedReadme = converter.makeHtml(decodeBase64(infoRepo.readme));
                                break;
                            case "rundown":
                                var converterRDoc = new Attacklab.rundown.converter();
                                var decodedReadme = converterRDoc.makeHtml(decodeBase64(infoRepo.readme));
                                break;
                            case "txt":
                                var decodedReadme = "<pre>" + decodeBase64(infoRepo.readme) + "</pre>"
                                break;
                            default:
                                var decodedReadme = "<h2>Repositorio sin archivo Readme<h2>";     
                        }
                    }                    
                        $('<div class="panel panel-primary"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin"><a href="' + infoRepo.html_url + '" target="_blank">' + infoRepo.name + '</a></p></div>' +
                        '<div class="panel-body"><div class="row"><div class="col-md-4"><p><b>Autor: </b>'+ infoRepo.owner + '</p></div>' + 
                        '<div class="col-md-4"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at.substring(0,10)) + '</p></div>' +
                        '<div class="col-md-4"><p><b>ID: </b>' + infoRepo.id + '</p></div></div>' +
                        '<div class="row"><div class="col-md-8"><b>Descripción: </b>' + infoRepo.description + '</div>' +
                        '<div class="col-md-4"><b>Perfil: </b>' + infoRepo.private + '</div></div>' + 
                        '<div class="row"><div class="col-md-12"><p><b>¿Mostrar?: </b>' + infoRepo.show + '</p></div>' + 
                        //'<div class="col-md-12 readme"><p><b>Readme: </b>' + converter.makeHtml(decodeBase64(infoRepo.readme)) + '</p></div></div>').appendTo(node);
                        '<div class="col-md-12 readme" class="style-Readme"><p><b>Readme: </b>' + decodedReadme + '</p></div></div>').appendTo(node);
                });
            });
            $('#container-main').removeClass("loading");
        });      
    };

    function verRepositoriosCategoria(categoryParam,idShowDiv){
        var reposFound = false;
        $('#container-main').addClass("loading");
        var node; 
        console.log(idShowDiv);
        //Según el parámetro de 
        var tempRef = new Firebase(nameBBDD + "Categories").orderByChild('name').equalTo(categoryParam).once("child_added", function(snapshot) {
           var reposCategory = snapshot.val();
           console.log(reposCategory);
           var category = reposCategory.id;
           //Solo devuelve un objeto con el id de la categoria y lo usamos para recuperar los repos de la categoria
           console.log(category);
            var tempRefCat = new Firebase(nameBBDD + "repos").orderByChild('category').equalTo(String(category)).on("value", function(repositories){
                //Creo un contador para colocar tres repositorios por cada fila y otro contador para notificar en un panel
                var cont = 1;
                var total = 0;
                repositories.forEach(function(repo) {
                    var infoRepo = repo.val();
                    if (infoRepo.show == false){
                        return;
                    }        
                    reposFound = true;
                    total++;
                    node = $("#column-" + idShowDiv + "-" + cont);
                    console.log(node);
                    $('<div class="panel panel-primary category-repositories"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin">' + infoRepo.name + '</p></div>' +
                    '<div class="panel-body"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at.substring(0,10)) + '</p>' +
                    '<p><b>Fecha Actualización: </b>'+ stringDate(infoRepo.updated_at.substring(0,10)) + '</p>' +
                    '<p><b>ID: </b>' + infoRepo.id + '</p></div></div>').hide().appendTo(node).fadeIn(1000);
                    if (cont == 1){
                        cont++;
                    }else{
                        cont=1;
                    }                    
                });
                if(reposFound == false){
                    $("<div class='jumbotron text-black'><h3 class='noRepos'>No existen repositorios pertenecientes a esta categoría<h3></div>").hide().appendTo($("#container-" + idShowDiv)).fadeIn(500);
                }else{
                    $("<div class='jumbotron text-black'><h3 class='noRepos'>Existen " + total + " repositorio(s) pertenecientes a esta categoría. Actualizado el día 'insertarDía'<h3></div>").hide().prependTo($("#container-" + idShowDiv)).fadeIn(500);
                }
            });
            $('#container-main').removeClass("loading");
        });      
    };
