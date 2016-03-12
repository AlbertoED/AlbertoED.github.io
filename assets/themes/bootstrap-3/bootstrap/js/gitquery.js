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
    //Variable para guardar las categorias sacadas de Firebase y así evitar las llamadas asíncronas
    var arrayCategories = new Array();

    /* CODIGO QUE SE EJECUTA CUANDO YA SE HA CARGADO LA PÁGINA */
    $(window).load(function(){
        var rutaEntera = window.location.pathname;
        var urlPag = rutaEntera.split("/").pop();
        if (urlPag == "admin.html" || urlPag == "admin"){
            $('#container-main').addClass("loading");
            getTokenFireBase(function(){
                $("#display-projects").cargaRepositoriosGithub();
            });    
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

    /* FUNCION PARA CARGAR LOS REPOSITORIOS EN LA PAGINA DE ADMIN */
    jQuery.fn.cargaRepositoriosGithub = function () {
        //Relleno el nombre de la cuenta
        document.getElementById("cuenta-git").innerHTML=cuentaGit;
        
        if (loadingProjects || stopLoadingProjects){
            return;
        }
        var description;
        var fechaIn;
        var fechaUp;
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
                //Ordenamos los repositorios en orden decreciente desde el más reciente
                sortByUpdateDate(repos); //Sorting by forks. You can customize it according to your needs.
                
                var node = $('#display-projects');
                $(repos).each(function () {
                    var IDRepo = this.id;
                    checkfork = this.fork;
                    //if (this.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                        //Comprobamos si tiene descripcion:
                        if (this.description == ''){
                            description = '-';
                        }else{
                            description = this.description;
                        }
                        //Recogemos las fechas y la ponemos en formato correcto
                        fechaIn = stringDate(this.created_at);
                        fechaUp = stringDate(this.updated_at);
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
                        '<div class="col-md-5"><div class="form-inline"><b>Categoría: </b><select id="select' + this.id + '" class="form-control"><option hidden value="0">Seleccione una categoría</option><option value="1">Agentes y Simulación Social</option><option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option></select></p></div></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Fecha última actualización: </b>' + fechaUp + '</div>' +
                        '<div class="col-md-2"><b>Perfil: </b>' + privacidad + '</div></div>' +
                        '<div class="row"><div class="col-md-12"><b>Descripción: </b><input type="text" class="form-control" placeholder="Este repositorio no tiene descripción en Github. Introduzca una personalizada." id="input-description' + this.id +'"></div></div></div></div>').hide().appendTo(node).fadeIn(1000);
                        //Comprobamos una vez creado el input de la descripción si existe una.
                        if (this.description != ""){
                            document.getElementById('input-description' + this.id).value = this.description;    
                        } 
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
                                        var selectValue = reposFire.category;
                                        var descripcionFirebase = reposFire.description;
                                        //console.log(IDRepo + " " + toggleValue + " " + selectValue);
                                        //Asignamos la categoria
                                        $("#select" + IDRepo).val(selectValue);
                                        //Fijamos el valor de mostrar
                                        if (toggleValue == true){
                                            $("#toggle" + IDRepo).bootstrapToggle('on');    
                                        }else{
                                            $("#toggle" + IDRepo).bootstrapToggle('off');
                                        }
                                        //Comprobamos si tiene descripción propia y si la tiene sobrescribimos la de GitHub
                                        if (descripcionFirebase != "-" ){
                                            document.getElementById('input-description' + IDRepo).value = descripcionFirebase;                  
                                        }                                                                                  
                                });
                            }
                        });
                    //}
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
                //Llamamos de manera síncrona a las funciones de obtener las fechas
                getLastUpdatingDate(function(data){
                    $('#fecha-ultima-actualizacion').hide().html('<b>' + data + '</b>').fadeIn(1000);
                    $('#fecha-actual-datos').hide().html('<b>' + getActualDatetime() + '</b>').fadeIn(1000);
                });
                $('#container-main').removeClass("loading");
        });
    };

    /* FUNCION QUE TOMA COMO PARAMETRO DE ENTRADA UNA STRING DE FECHA Y LO DEVUELVE EN OTRO FORMATO */
    function stringDate(date) {
        return (date.substring(8,10) + '-' + date.substring(5,7) + '-' + date.substring(0,4) +' ' + date.substring(11,13) + ':' + date.substring(14,16));
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
        if (day < 10){
            day = ("0" + day);
        } 
        if (month < 10){
            month = ("0" + month);
        } 

        var actualDate = (day + "/" + month + "/" + year + " " + hours + ":" + minutes + " ");
        console.log(actualDate);
        return actualDate;
    }; 

    /* FUNCION PARA RECUPERAR ULTIMA FECHA DE MODIFICACION */
    function getLastUpdatingDate(callback) {
        refTemp = new Firebase(nameBBDD + 'info-web/updated_date');
        refTemp.on("value", function(snapshot) {
                var lastDate = snapshot.val();
                callback(lastDate);
        });
    };

    /* FUNCION PARA RECUPERAR ULTIMA FECHA DE MODIFICACION DE LOS MIEMBROS */
    function getLastUpdatingDateMembers(callback) {
        refTemp = new Firebase(nameBBDD + 'info-web/updated_date_members');
        refTemp.on("value", function(snapshot) {
                var lastDate = snapshot.val();
                callback(lastDate);
        });
    };

    /* FUNCION PARA RECUPERAR EL TOKEN DE GITHUB ALOJADO EN FIREBASE */
    function getTokenFireBase(callback) {
        refTemp = new Firebase(nameBBDD + 'Tokens');
        refTemp.on("value", function(snapshot) {
                var tokens = snapshot.val();
                $(tokens).each(function () {
                    if (this.user == cuentaGit){
                        tokenGit = this.token;
                        loadingProjects = false;
                        callback();
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
            jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseRepoInfo) {
                var repoGroup = responseRepoInfo.data;            
                console.log(repoGroup.length);
                //sortByForks(repos); //Sorting by forks. You can customize it according to your needs.
                document.getElementById("display-projects").innerHTML="";
                var node = $('#display-projects');
                $(repoGroup).each(function () {
                    //Si el nombre o el id del proyecto no cuadran con el filtro continuamos con el siguiente proyecto y este no lo mostramos
                    if (((this.name).toUpperCase().indexOf(filter) == -1) && (String((this.id)).indexOf(filter) == -1)){
                        return;
                    }
                    //Si llega a este punto significa que ha encontrado algún repositorio que cuadre con el filtro
                    filterFound = true;
                    var IDRepo = this.id;
                    checkfork = this.fork;
                    //if (this.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                        //Comprobamos si tiene descripcion:
                        if (this.description == ''){
                            description = '-';
                        }else{
                            description = this.description;
                        }
                        //Recogemos las fechas y la ponemos en formato correcto
                        fechaIn = stringDate(this.created_at);
                        fechaUp = stringDate(this.updated_at);
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
                        '<div class="col-md-5"><div class="form-inline"><b>Categoría: </b><select id="select' + this.id + '" class="form-control"><option hidden value="0">Seleccione una categoría</option><option value="1">Agentes y Simulación Social</option><option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option></select></p></div></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Fecha última actualización: </b>' + fechaUp + '</div>' +
                        '<div class="col-md-2"><b>Perfil: </b>' + privacidad + '</div></div>' +
                        '<div class="row"><div class="col-md-12"><b>Descripción: </b><input type="text" class="form-control" placeholder="Este repositorio no tiene descripción en Github. Introduzca una personalizada." id="input-description' + this.id +'"></div></div></div></div>').hide().appendTo(node).fadeIn(1000);
                        //Comprobamos una vez creado el input de la descripción si existe una.
                        if (this.description != ""){
                            document.getElementById('input-description' + this.id).value = this.description;    
                        } 
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
                                        var descripcionFirebase = reposFire.description;
                                        console.log(IDRepo + " " + toggleValue + " " + selectValue);
                                        $("#select" + IDRepo).val(selectValue);
                                        if (toggleValue == true){
                                            $("#toggle" + IDRepo).bootstrapToggle('sí');    
                                        }else{
                                            $("#toggle" + IDRepo).bootstrapToggle('no');
                                        }
                                        //Comprobamos si tiene descripción propia y si la tiene sobrescribimos la de GitHub
                                        if (descripcionFirebase != "-" ){
                                            document.getElementById('input-description' + IDRepo).value = descripcionFirebase;                  
                                        }                                                                                  
                                });
                            }
                        });
                    //}
                });               
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
                    $('#btnGuardarRepositorios-abajo').hide();
                    $("<h3 class='noRepos'>Ningún repositorio coincide con la búsqueda<h3>").hide().appendTo($("#display-projects")).fadeIn(1000);
                }else{
                    $('#btnGuardarRepositorios-abajo').show();
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
                        jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/contributors?access_token=' + tokenGit + '&callback=?', function(reponseCollaborators) {            
                            //Recorremos la respuesta y guardamos el nombre de cada colaborador en un array
                            var collaborators = reponseCollaborators.data;
                            var collaboratorsRepo = new Array();
                            var i = 0;
                            if (collaborators == undefined){
                                collaboratorsRepo[0] = "Autor no especificado"
                            }else{
                                $(collaborators).each(function() {
                                    collaboratorsRepo[i] = this.login;
                                    i++;
                                });
                            }
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
                            if ($('#input-description' + responseRepoInfo.data.id).val() == ''){
                                var description = '-';
                            }else{
                                var description = $('#input-description' + responseRepoInfo.data.id).val();
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
        Get admins
        https://api.github.com/orgs/gsi-upm/members?&role=admin&access_token=
    
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
        $('body').addClass("stop-scrolling");
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
                            nOK++;
                            var fechaIn;
                            var privacidad;
                            checkfork = responseRepoInfo.data.fork;
                            if (responseRepoInfo.data.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                                //Recogemos la fecha y la ponemos en formato correcto
                                fechaIn = stringDate(responseRepoInfo.data.created_at);
                                //Comprobamos si es público o privado
                                if (responseRepoInfo.data.private == true){
                                    privacidad = "PRIVADO";
                                }else{
                                    privacidad = "PÚBLICO";
                                }                              
                                jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/readme?access_token=' + tokenGit + '&callback=?', function(responseReadme) {  
                                    jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + nameRepo + '/contributors?access_token=' + tokenGit + '&callback=?', function(reponseCollaborators) {            
                                        //Recorremos la respuesta y guardamos el nombre de cada colaborador en un array
                                        var collaborators = reponseCollaborators.data;
                                        var collaboratorsRepo = new Array();
                                        var i = 0;
                                        if (collaborators == undefined){
                                            collaboratorsRepo[0] = ("Autor no especificado");
                                        }else{
                                            $(collaborators).each(function() {
                                                collaboratorsRepo[i] = this.login;
                                                i++;
                                            });
                                        }
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
                                        
                                        if( nOK == nTotal ) {
                                           $('#container-main').removeClass("loading");
                                           $('body').removeClass("stop-scrolling");
                                            $(".notifications .notification.actualizado.ok").addClass("active");
                                            setTimeout(function() {
                                                $(".notifications .notification.actualizado").removeClass("active");
                                            }, 3000);
                                            //Cuando termina, guardamos en firebase la fecha de actualización
                                            var actualdate = getActualDatetime();
                                            $('#fecha-ultima-actualizacion').hide().html('<b>' + actualdate + '</b>').fadeIn(1000);
                                            myDataRef.child("info-web").update({
                                                updated_date: actualdate
                                            });
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

    function sortByUpdateDate(repos) {
        repos.sort(function (a,b){
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
    }

    /* FUNCION PARA GUARDAR LA INFORMACION DE LOS COLABORADORES EN FIREBASE */
    function actualizarMiembros(){
        //Antes de empezar, recogemos el Token, ya que esta función se puede ejecutar desde cualquier página y puede que no se haya leído el token
        getTokenFireBase(function(){            
            //Cerramos el modal
            $('#myModalMiembros').modal('hide');
            $('#container-main').addClass("loading");
            var reposRef = myDataRef.child("members");
            //Borramos todos los datos de FireBase y volvemos a cargarlos
            reposRef.remove();
            //Primero buscamos los usuarios miembros que no son admin para guardar su rol (ya que el rol no aparece como propiedad)
            console.log('https://api.github.com/orgs/' + cuentaGit + '/members?role=member&per_page=1000&access_token=' + tokenGit + '&callback=?');
            jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/members?role=member&per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseMembers) {            
                //Recorremos la respuesta y guardamos los campos link, url de la imagen y asignamos el rol
                var members = responseMembers.data;
                $(members).each(function() {
                    reposRef.child(this.id).set({
                        id: this.id,
                        name: this.login,
                        html_url: this.html_url,
                        url_image: this.avatar_url,
                        rol: "Miembro"
                    });                      
                });
                //Una vez guardados los miembros, realizamos el mismo proceso para los admins
                jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/members?role=admin&per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseAdmins) {            
                    //Recorremos la respuesta y guardamos los campos link, url de la imagen y asignamos el rol
                    var admins = responseAdmins.data;
                    $(admins).each(function() {
                        reposRef.child(this.id).set({
                            id: this.id,
                            name: this.login,
                            html_url: this.html_url,
                            url_image: this.avatar_url,
                            rol: "Admin"
                        });                      
                    });
                    $('#container-main').removeClass("loading");
                    var actualdate = getActualDatetime();
                    myDataRef.child("info-web").update({
                        updated_date_members: actualdate
                    });
                    $(".notifications .notification.actualizado.ok").addClass("active");
                    setTimeout(function() {
                        $(".notifications .notification.actualizado").removeClass("active");
                    }, 3000);
                });                                                                                
            });
        });
    };

    /* FUNCION PARA VOLVER A LA PAGINA ANTERIOR */
    function goBack(){
        console.log("entra");
        window.history.back(); 
    }

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
    function showInfoRepository(idParam) {
        $('#container-main').addClass("loading");
        node = $('#container-repo');
        var tempRef = new Firebase(nameBBDD + "repos/" + idParam)
        tempRef.on("value", function(snapshot) {
            //Si el id no existe, redireccionamos a Repositorios:
            var elementFirebase = snapshot.exists();
            if (elementFirebase == false){
                location.href = "/Repositorios.html";
            }
            var infoRepo = snapshot.val();
           //Compruebo que sea un repositorio visible, por si acaso
            if (infoRepo.show == false){
                $("<div class='jumbotron text-black'><h3 class='noRepos'>Repositorio no visible<h3></div>").hide().appendTo(node).fadeIn(500);
                return;
            }
            $('<div class="jumbotron title-repos"><a class="go-back adapted" onclick="goBack()" title="Volver"></a><h2><a href="' + infoRepo.html_url + '" target="_blank">' + infoRepo.name + '</a></h2></div>').appendTo($('#titulo-repositorio'));
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
            //Recojo la categoría
            var tempRefCat = new Firebase(nameBBDD + "Categories/" + infoRepo.category + "/name")
            tempRefCat.on("value", function(snapshotCat) {
                var cat = snapshotCat.val();
                //Guarda en una variable si el perfil es público o privado
                if (infoRepo.private == false){
                    var perfilGit = "Público"
                }else{
                    var perfilGit = "Privado"
                }
                //Guardo el tamaño en una variable
                if (infoRepo.size >= 1024){
                    var tamano = (infoRepo.size/1024).toFixed(2) + " MB";
                }else{
                    var tamano = infoRepo.size + " KB";
                }
                //Guarda los colaboradores   
                var arrayCollaborators = infoRepo.collaborators;
                var stringCollaborators  = "";
                for (var p = 0; (p <= arrayCollaborators.length - 1); p++) {
                    if (p == arrayCollaborators.length - 1){
                        stringCollaborators += arrayCollaborators[p];
                    }else{
                        stringCollaborators += arrayCollaborators[p] + " | ";
                    }
                }; 
                console.log(stringCollaborators);
                $('<div class="panel panel-primary"><div class="panel-body">' +
                '<div class="row"><div class="col-md-8"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Descripción: </b></div><div class="panel-body info-repo">' + infoRepo.description + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Fecha última modificación: </b></div><div class="panel-body info-repo">' + stringDate(infoRepo.updated_at) + '</div></div></div></div>' + 
                '<div class="row"><div class="col-md-8"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Categoría: </b></div><div class="panel-body info-repo">' + cat + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Fecha Creación: </b></div><div class="panel-body info-repo">'+ stringDate(infoRepo.created_at) + '</div></div></div></div>' +
                '<div class="row"><div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Autor: </b></div><div class="panel-body info-repo">'+ infoRepo.owner + '</div></div></div>' + 
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>ID: </b></div><div class="panel-body info-repo">' + infoRepo.id + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Perfil: </b></div><div class="panel-body info-repo">' + perfilGit + '</div></div></div></div>' +
                '<div class="row"><div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Lenguaje principal: </b></div><div class="panel-body info-repo">'+ infoRepo.language + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Tamaño del proyecto: </b></div><div class="panel-body info-repo">' + tamano + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo" style="border:none;"><div class="panel-body info-repo"><a href="' + infoRepo.download_zip_url + '" title="Descargar proyecto"><img border="0" class="img-zip" src="assets/themes/bootstrap-3/css/images/zip-logo.png" width="51" height="51"></a><a target="_blank" href="' + infoRepo.html_url + '" title="Ver proyecto en GitHub"><img class="img-git" border="0" src="assets/themes/bootstrap-3/css/images/git-url.png" width="51" height="51"></a></div></div></div></div>' +
                '<div class="row"><div class="col-md-12"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Colaboradores: </b></div><div class="panel-body info-repo" style="text-align: center;">' + stringCollaborators + '</div></div></div></div>' +                 
                '<div class="row"><div class="col-md-12 readme" class="style-Readme"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Readme: </b></div><div class="panel-body info-repo">' + decodedReadme + '</div></div></div></div>').appendTo(node);           
                $('#container-main').removeClass("loading");
            });
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
                    //Guardo los colaboradores:
                    var arrayCollaborators = infoRepo.collaborators;
                    var stringCollaborators  = "";
                    for (var p = 0; (p <= arrayCollaborators.length - 1); p++) {
                        if (p == arrayCollaborators.length - 1){
                            stringCollaborators += arrayCollaborators[p];
                        }else{
                            stringCollaborators += arrayCollaborators[p] + " | ";
                        }
                    };       
                    reposFound = true;
                    total++;
                    node = $("#column-" + idShowDiv + "-" + cont);
                    console.log(node);
                    $('<div class="panel panel-primary category-repositories" onclick="addIdReposToURL(' + infoRepo.id +')"><div class="panel-heading category-repositories" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin">' + infoRepo.name + '</p></div>' +
                    '<div class="panel-body"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at) + '</p>' +
                    '<p><b>Fecha Actualización: </b>'+ stringDate(infoRepo.updated_at) + '</p>' +
                    '<p><b>Autores: </b>' + stringCollaborators + '</p></div></div>').hide().appendTo(node).fadeIn(1000);
                    if (cont == 1){
                        cont++;
                    }else{
                        cont=1;
                    }                    
                });
                if(reposFound == false){
                    $("<div class='jumbotron text-black'><h3 class='noRepos'>No existen repositorios pertenecientes a esta categoría<h3></div>").hide().appendTo($("#container-" + idShowDiv)).fadeIn(500);
                }else{
                    //Llamamos de manera síncrona a las funciones de obtener las fechas
                    getLastUpdatingDate(function(data){
                        $("<div class='jumbotron text-black'><h4 class='noRepos'>Existen " + total + " repositorio(s) pertenecientes a esta categoría. Actualizado el día " + data.substring(0,10) + " a las " + data.substring(10,16) + " <h4></div>").hide().prependTo($("#container-" + idShowDiv)).fadeIn(500);
                    });
                }
            });
            $('#container-main').removeClass("loading");
        });      
    };

    function showMembers(){
        $('#container-main').addClass("loading");
        node = $('#container-members');
        var tempRef = new Firebase(nameBBDD + "members");
        var total = 0;
        var cont = 1;
        tempRef.on("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                console.log(childData.name);
                total++;
                //<span class="glyphicon glyphicon-star-empty"></span>
                node = $("#column-mem-" + cont);
                console.log(node);
                if (childData.rol == "Admin"){
                    $('<div class="panel panel-primary"><div class="panel-heading category-repositories" style="background-color: #0683AD;background-image: none; text-align:center;"><p class="titleReposAdmin"><span title="Administrador" class="glyphicon glyphicon-star" style="float: left;"></span><a target="_blank" href="' + childData.html_url + '">' + childData.name + '</a></p></div>' +
                    '<div class="panel-body"><img src="'+ childData.url_image +'" class="img-responsive adapted image-member"/></div></div>').hide().appendTo(node).fadeIn(1000);
                }else{
                    $('<div class="panel panel-primary"><div class="panel-heading category-repositories" style="background-color: #0683AD;background-image: none; text-align:center;"><p class="titleReposAdmin"><a target="_blank" href="' + childData.html_url + '">' + childData.name + '</a></p></div>' +
                    '<div class="panel-body"><img src="'+ childData.url_image +'" class="img-responsive adapted image-member"/></div></div>').hide().appendTo(node).fadeIn(1000);
                }
                if ((cont == 1) || (cont == 2) || (cont == 3) || (cont == 4) || (cont == 5)){
                    cont++;
                }else{
                    cont=1;
                }           
            });
            //Informo de la cantidad de miembros y la fecha de actualizacion de los miembros
            getLastUpdatingDateMembers(function(data){
                $("<div class='jumbotron text-black'><h4 class='noRepos'>Existen <b>" + total + "</b> miembros pertenecientes a la organización de " + cuentaGit + " de GitHub. Actualizado el día " + data.substring(0,10) + " a las " + data.substring(10,16) + " <h4></div>").hide().prependTo($("#title-members")).fadeIn(500);
            });
            $('#container-main').removeClass("loading");
        });    
    };

    function showAllRepos(){
        $('#container-main').addClass("loading");
        node = $('#container-repositories-all');
        var tempRef = new Firebase(nameBBDD + "repos");
        var total = 0;
        tempRef.on("value", function(snapshot) {
            var reposSort = snapshot.val();
            var myArray = new Array();
            //Guardo en un array los elementos que se deben visualizar (show=true)
            $.each(reposSort, function(key, value) {
                if(value.show == true){
                    myArray.push(value);
                }
            });
            sortByUpdateDate(myArray);
            //En este punto ya tenemos un aarray con los elementos ordenados por la fecha de actualizacion en orden decreciente desde la más reciente
            myArray.forEach(function(childSnapshot) {
                var infoRepo = childSnapshot;
                console.log(infoRepo.updated_at);
                //console.log(new Date(infoRepo.updated_at));
                //Compruebo si el repositorio es visible
                //if (infoRepo.show == false){
                  //      return;
                //}
                //Recojo la categoría
                //var tempRefCat = new Firebase(nameBBDD + "Categories/" + infoRepo.category + "/name")
                //tempRefCat.on("value", function(snapshotCat) {
                    //var cat = snapshotCat.val();  
                    console.log(arrayCategories)
                    var cat = arrayCategories[infoRepo.category];  
                    total++;
                    console.log("Entra bucle " + infoRepo.updated_at);
                    //Guardo los colaboradores:
                    var arrayCollaborators = infoRepo.collaborators;
                    var stringCollaborators  = "";
                    for (var p = 0; (p <= arrayCollaborators.length - 1); p++) {
                        if (p == arrayCollaborators.length - 1){
                            stringCollaborators += arrayCollaborators[p];
                        }else{
                            stringCollaborators += arrayCollaborators[p] + " | ";
                        }
                    };    
                    $('<div class="panel panel-primary category-repositories all" onclick="addIdReposToURL(' + infoRepo.id +')"><div class="panel-heading category-repositories" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin">' + infoRepo.name + '</p></div>' +
                    '<div class="panel-body"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at) + '</p>' +
                    '<p><b>Fecha Actualización: </b>'+ stringDate(infoRepo.updated_at) + '</p>' +
                    '<p><b>Categoría: </b>'+ cat + '</p>' +
                    '<p style="text-align:justify;"><b>Descripción: </b>' + infoRepo.description + '</p></div></div>').hide().appendTo(node).fadeIn(1000);   
                //});
            });
            //Llamamos de manera síncrona a las funciones de obtener las fechas
            getLastUpdatingDate(function(data){
                $("<h4 style='color:black;'>La organización " + cuentaGit + " cuenta con " + total + " repositorios almacenados en GitHub, actualizado el día " + data.substring(0,10) + " a las " + data.substring(10,16) + ".<h4></div>").hide().prependTo($("#intro-repositorios-all")).fadeIn(500);
            });
            $('#container-main').removeClass("loading");
        });    
    }

    /* FUNCIÓN PARA CARGAR EN UN ARRAY GLOBAL LAS CATEGORÍAS */
    function getCategories(callback) {
        var tempRefCat = new Firebase(nameBBDD + "Categories")
        tempRefCat.on("value", function(snapshotCat) {
            var data = snapshotCat.val();
            data.forEach(function(childSnapshot) {  
                arrayCategories[childSnapshot.id] = childSnapshot.name;
            });
            callback();
        });
    }

    function addIdReposToURL(idRepo){
        reposUrl = "/Repositorio.html?";
        reposUrl = reposUrl + "&id=" + idRepo;
        window.location.href = reposUrl;
        console.log(reposUrl);
        //return _url;
    }

