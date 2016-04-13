/*** FUNCIONES DEL MODULO DE ADMINISTRACION ****/ 

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
                }
            });
        });
    };

    /* FUNCION PARA CARGAR LOS REPOSITORIOS EN LA PAGINA DE ADMIN */
    function loadRepositoriesGithub() {
        //Relleno el nombre de la cuenta
        document.getElementById("cuenta-git").innerHTML=cuentaGit;
        
        if (loadingProjects || stopLoadingProjects){
            return;
        }
        //Monto la cadena del combo de las categorias a partir del array de categorias ya cargado. La categoría 'sin asignar' se modifica
        var stringCategoriesOptions  = "";
       for (var p = 0; (p <= arrayCategories.length - 1); p++) {
           if (arrayCategories[p] == "Sin asignar"){
                stringCategoriesOptions += '<option hidden value="' + p + '">Seleccione una categoría</option>';
                //1Agentes y Simulación Social<option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option>
           }else{
                stringCategoriesOptions += '<option value="' + p + '">' + arrayCategories[p] + '</option>'
           }
        };
        console.log(stringCategoriesOptions);
        var description;
        var fechaIn;
        var fechaUp;
        var privacidad;
        var target = this;
        loadingProjects = true;
        jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=9&access_token=' + tokenGit + '&page=' + currentPage + '&callback=?', function(data) {
            console.log(data);
            repos = data.data;
            // Comprobamos si la peticion ya no devuelve mas objetos y en ese caso ya no se envían mas peticiones a github
            // y se termina el infinite scroll
            if (repos.length == 0){
                $('#load-more').remove();
                stopLoadingProjects = true;
                return;
            }
            //Ordenamos los repositorios en orden decreciente desde el más reciente
            sortRepos(repos,"updated","desc");
            
            var node = $('#display-projects');
            $(repos).each(function () {
                var IDRepo = this.id;
                checkfork = this.fork;
                //if (this.name != (cuentaGit.toLowerCase() + '.github.io')){
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
                    '<div class="col-md-5"><div class="form-inline"><b>Categoría: </b><select id="select' + this.id + '" class="form-control">' + stringCategoriesOptions + '</select></p></div></div> ' +
                    '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></p></div></div>' +
                    '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                    '<div class="col-md-8"><b>Fecha última actualización: </b>' + fechaUp + '</div>' +
                    '<div class="col-md-2"><b>Perfil: </b>' + privacidad + '</div></div>' +
                    '<div class="row"><div class="col-md-12"><b>Descripción: </b><input style="margin-bottom:10px;" type="text" class="form-control" placeholder="Este repositorio no tiene descripción en Github. Introduzca una personalizada." id="input-description' + this.id +'"></div></div>' +
                    '<div class="row"><div class="col-md-12"><b>URL imagen: </b><input type="text" class="form-control" placeholder="Introduzca una url con la imagen para el proyecto" id="input-urlImage' + this.id +'"></div></div></div></div>').hide().appendTo(node).fadeIn(1000);                        
                    //Comprobamos una vez creado el input de la descripción si existe una.
                    if (this.description != ""){
                        document.getElementById('input-description' + this.id).value = this.description;    
                    } 
                    //Incluimos efecto de fade in para los nuevos repositoios que se muestran
                    //Comprobamos si ya hay datos guardados en Firebase para cada repositorio
                    myDataRef.once("value", function(snapshot) {
                        var elementFirebase = snapshot.child("repos/" + IDRepo).exists();
                        //Si está en Firebase, recuperamos el valor del select y del toggle y los asignamos al panel del repositorio
                        if (elementFirebase == true){
                            refTemp = new Firebase(nameBBDD +   'repos/' + IDRepo);
                            refTemp.on("value", function(snapshot) {
                                    var reposFire = snapshot.val();
                                    var toggleValue = reposFire.show;
                                    var selectValue = reposFire.category;
                                    var descripcionFirebase = reposFire.description;
                                    var urlImage = reposFire.urlImage;                                    
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
                                    //Comprobamos si tiene url de imagen ya definida y si la tiene la mostramos
                                    if (urlImage != "assets/themes/bootstrap-3/css/images/image-url-default.png" ){
                                        document.getElementById('input-urlImage' + IDRepo).value = urlImage;                  
                                    }                                                                                     
                            });
                        }
                    });
                //}
            });
            $('#btnGuardarRepositorios-abajo').show();
            //IMPORTANTE: esta linea transforma todos los checkboxes que hemos añadido al html en los toggles
            $('input[type="checkbox"]').bootstrapToggle({
                    on: 'Sí',
                    off: 'No'
            });
            loadingProjects = false;
            //Llamamos de manera síncrona a las funciones de obtener las fechas
            getLastUpdatingDate(function(data){
                $('#fecha-ultima-actualizacion').hide().html('<b>' + data + '</b>').fadeIn(1000);
                $('#fecha-actual-datos').hide().html('<b>' + getActualDatetime() + '</b>').fadeIn(1000);
            });
            $('#container-main').removeClass("loading");
        });
    };

    /* FUNCION PARA MOSTRAR TANTOS PROYECTOS COMO QUEPAN EN LA PANTALLA */
    function loadMore() {
        currentPage++;
        loadRepositoriesGithub();
    };

    /* FUNCION PARA FILTRAR POR NOMBRE E ID EN LA PÁGINA DE ADMIN */
    function filterRepositories(){
        var filterFound = false;
        //Comprobamos si se ha introducido algun filtro:
        if ($('#srch-control-navbar').val() != ''){
            isFilter = true;
            //Monto la cadena del combo de las categorias a partir del array de categorias ya cargado. La categoría 'sin asignar' se modifica
            var stringCategoriesOptions  = "";
           for (var p = 0; (p <= arrayCategories.length - 1); p++) {
               if (arrayCategories[p] == "Sin asignar"){
                    stringCategoriesOptions += '<option hidden value="' + p + '">Seleccione una categoría</option>';
                    //1Agentes y Simulación Social<option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option>
               }else{
                    stringCategoriesOptions += '<option value="' + p + '">' + arrayCategories[p] + '</option>'
               }
            };
            var filter = $('#srch-control-navbar').val().toUpperCase();
            jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseRepoInfo) {
                var repoGroup = responseRepoInfo.data;            
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
                        '<div class="col-md-5"><div class="form-inline"><b>Categoría: </b><select id="select' + this.id + '" class="form-control">' + stringCategoriesOptions + '</select></p></div></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Fecha última actualización: </b>' + fechaUp + '</div>' +
                        '<div class="col-md-2"><b>Perfil: </b>' + privacidad + '</div></div>' +
                        '<div class="row"><div class="col-md-12"><b>Descripción: </b><input style="margin-bottom:10px;" type="text" class="form-control" placeholder="Este repositorio no tiene descripción en Github. Introduzca una personalizada." id="input-description' + this.id +'"></div></div>' +
                        '<div class="row"><div class="col-md-12"><b>URL imagen: </b><input type="text" class="form-control" placeholder="Introduzca una url con la imagen para el proyecto" id="input-urlImage' + this.id +'"></div></div></div></div>').hide().appendTo(node).fadeIn(1000);            
                        //Comprobamos una vez creado el input de la descripción si existe una.
                        if (this.description != ""){
                            document.getElementById('input-description' + this.id).value = this.description;    
                        } 
                        //Incluimos efecto de fade in para los nuevos repositoios que se muestran
                        //Comprobamos si ya hay datos guardados en Firebase para cada repositorio
                        myDataRef.once("value", function(snapshot) {
                            var elementFirebase = snapshot.child("repos/" + IDRepo).exists();
                            //Si está en Firebase, recuperamos el valor del select y del toggle y los asignamos al panel del repositorio
                            if (elementFirebase == true){
                                refTemp = new Firebase(nameBBDD +   'repos/' + IDRepo);
                                refTemp.on("value", function(snapshot) {
                                        var reposFire = snapshot.val();
                                        var toggleValue = reposFire.show;
                                        var selectValue = reposFire.category
                                        var descripcionFirebase = reposFire.description;
                                        var urlImage = reposFire.urlImage;
                                        $("#select" + IDRepo).val(selectValue);
                                        if (toggleValue == true){
                                            $("#toggle" + IDRepo).bootstrapToggle('on');    
                                        }else{
                                            $("#toggle" + IDRepo).bootstrapToggle('off');
                                        }
                                        //Comprobamos si tiene descripción propia y si la tiene sobrescribimos la de GitHub
                                        if (descripcionFirebase != "-" ){
                                            document.getElementById('input-description' + IDRepo).value = descripcionFirebase;                  
                                        }
                                        //Comprobamos si tiene url de imagen ya definida y si la tiene la mostramos
                                        if (urlImage != "assets/themes/bootstrap-3/css/images/image-url-default.png" ){
                                            document.getElementById('input-urlImage' + IDRepo).value = urlImage;                  
                                        }                                                                                     
                                });
                            }
                        });
                    //}
                });
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

    /* FUNCION PARA QUITAR FILTROS Y VER TODOS REPOSITORIOS EN LA PAGINA DE ADMIN */
    function filterOffAdmin(){
        stopLoadingProjects = false;
        loadingProjects = false;
        currentPage = 1;
        if (isFilter == true){
            document.getElementById("display-projects").innerHTML="";
            loadRepositoriesGithub()
        }
        isFilter = false;
        $('#srch-control-navbar').val("");
    };

    /* FUNCION PARA GUARDAR LOS REPOSITORIOS EN FIREBASE */
    function saveRepositories(){
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
                        if ((collaborators == undefined) || (collaborators.length == 0)){
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
                        //Comprobamos si tiene urlImage personalizada:
                        if ($('#input-urlImage' + responseRepoInfo.data.id).val() == ''){
                            var urlImageFire = "assets/themes/bootstrap-3/css/images/image-url-default.png";
                        }else{
                            var urlImageFire = $('#input-urlImage' + responseRepoInfo.data.id).val();
                        }
                        reposRef.child(responseRepoInfo.data.id).set({
                            id: responseRepoInfo.data.id,
                            name: responseRepoInfo.data.name,
                            owner: responseRepoInfo.data.owner.login,
                            html_url: responseRepoInfo.data.html_url,
                            urlImage: urlImageFire,
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

    /* FUNCION PARA COMPROBAR SI ALGUN REPOSITORIO GUARDADO HA SIDO ELIMINADO */
    function checkDeletedRepositories() {
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
    function deleteRepositories() {
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

    /* FUNCION PARA ACTUALIZAR LOS DATOS DE LOS REPOSITORIOS EN FIREBASE. SI ALGUNO NO ESTÁ EN FIREBASE SE AÑADE */
    function updateRepositories() {
        //Cerramos el modal
        $('#confirmar-actualizar').modal('hide');
        $('#container-main').addClass("loading");
        $('body').addClass("stop-scrolling");
        var reposRef = myDataRef.child("repos")
        jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseRepos){
        repos = responseRepos.data;
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
                            //if (responseRepoInfo.data.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
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
                                        if ((collaborators == undefined) || (collaborators.length == 0)){
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
                            //}                             
                        } else {
                            nOK++;
                        }
                    });
                }); 
            });
            
        });
    };        

    /* FUNCION PARA GUARDAR LA INFORMACION DE LOS COLABORADORES EN FIREBASE */
    function updateMembers(){
        //Antes de empezar, recogemos el Token, ya que esta función se puede ejecutar desde cualquier página y puede que no se haya leído el token
        getTokenFireBase(function(){            
            //Cerramos el modal
            $('#myModalMiembros').modal('hide');
            $('#container-main').addClass("loading");
            var reposRef = myDataRef.child("members");
            //Borramos todos los datos de FireBase y volvemos a cargarlos
            reposRef.remove();
            //Primero buscamos los usuarios miembros que no son admin para guardar su rol (ya que el rol no aparece como propiedad)
            jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/members?role=member&per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseMembers) {            
                //Recorremos la respuesta y guardamos los campos link, url de la imagen y asignamos el rol
                var members = responseMembers.data;
                $(members).each(function() {
                    reposRef.child(this.id).set({
                        id: this.id,
                        name: this.login,
                        html_url: this.html_url,
                        url_image: this.avatar_url,
                        role: "Miembro"
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
                            role: "Admin"
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

    /* FUNCION PARA GUARDAR LOS EQUIPOS EN FIREBASE */
    function updateTeams() {
        //Antes de empezar, recogemos el Token, ya que esta función se puede ejecutar desde cualquier página y puede que no se haya leído el token
        getTokenFireBase(function(){   
            //Cerramos el modal
            $('#myModalEquipos').modal('hide');
            $('#container-main').addClass("loading");
            var reposRef = myDataRef.child("teams");
            //Borramos todos los datos de FireBase y volvemos a cargarlos
            reposRef.remove();
            //Realizamos la llamada que devuelve todos los equipos actuales
            jQuery.getJSON('https://api.github.com/orgs/' + cuentaGit + '/teams?&per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseTeams) {
                teamsGit = responseTeams.data; // JSON Parsing
                var nOK = 0;
                var nTotal = $(teamsGit).length;
                //Recorremos la respuesta y para cada uno realizamos una llamada para recoger el listado de los miembros pertenecientes
                $(teamsGit).each(function () {
                    var idTeam = this.id;
                    var nameTeam = this.name         
                    //Montamos la llamada
                    jQuery.getJSON('https://api.github.com/teams/' + idTeam + '/members?&per_page=1000&access_token=' + tokenGit + '&callback=?', function(responseOneTeam) {
                        var membersGit = responseOneTeam.data;
                        var membersArray = new Array();
                        var i = 0;  
                        if ((membersGit == undefined) || (membersGit.length == 0)){
                            membersArray[0] = "Sin miembros"
                        }else{
                            $(membersGit).each(function() {
                                membersArray[i] = this.login;
                                i++;
                            });
                        }
                        //Guardo los datos del equipo
                        reposRef.child(idTeam).set({
                            id: idTeam,
                            name: nameTeam,
                            members: membersArray
                        });
                    });
                });
                $('#container-main').removeClass("loading");
                var actualdate = getActualDatetime();
                myDataRef.child("info-web").update({
                    updated_date_teams: actualdate
                });
                $(".notifications .notification.actualizado.ok").addClass("active");
                setTimeout(function() {
                    $(".notifications .notification.actualizado").removeClass("active");
                }, 3000);
            });
        });
    };
