/*** FUNCIONES DEL MODULO DE VISUALIZACION - MOSTRAR INFORMACION ****/ 
	/* FUNCION PARA MOSTRAR LA INFORMACION ESPECIFICA DE UN REPOSITORIO CUYO ID SE PASA POR PARAMETRO */
    function showInfoRepository(idParam) {
        $('#container-main').addClass("loading");
        $('body').addClass("stop-scrolling");
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
                $('<div class="panel panel-primary"><div class="panel-body"><div class="row">' +
                '<div class="col-md-8"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Descripción: </b></div><div class="panel-body info-repo">' + infoRepo.description + '</div></div>' +
                '<div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Categoría: </b></div><div class="panel-body info-repo">' + cat + '</div></div>' +
                '<div class="row"><div class="col-md-6"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Fecha Creación: </b></div><div class="panel-body info-repo">'+ stringDate(infoRepo.created_at) + '</div></div></div>' +
                '<div class="col-md-6"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Fecha última modificación: </b></div><div class="panel-body info-repo">' + stringDate(infoRepo.updated_at) + '</div></div></div></div>' + 
                '<div class="row"><div class="col-md-6"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Propietario: </b></div><div class="panel-body info-repo">'+ infoRepo.owner + '</div></div></div>' + 
                '<div class="col-md-6"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>ID: </b></div><div class="panel-body info-repo">' + infoRepo.id + '</div></div></div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-body info-repo panel-image"><img class="img-responsive" src="' + infoRepo.urlImage + '"></div></div></div></div>' +
                '<div class="row"><div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Lenguaje principal: </b></div><div class="panel-body info-repo">'+ infoRepo.language + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Tamaño base del proyecto: </b></div><div class="panel-body info-repo">' + tamano + '</div></div></div>' +
                '<div class="col-md-4"><div class="panel panel-primary info-repo" style="border:none;"><div class="panel-body info-repo"><a href="' + infoRepo.download_zip_url + '" title="Descargar proyecto"><img border="0" class="img-zip" src="assets/themes/bootstrap-3/css/images/zip-logo.png" width="51" height="51"></a><a target="_blank" href="' + infoRepo.html_url + '" title="Ver proyecto en GitHub"><img class="img-git" border="0" src="assets/themes/bootstrap-3/css/images/git-url.png" width="51" height="51"></a></div></div></div></div>' +
                '<div class="row"><div class="col-md-8"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Colaboradores: </b></div><div class="panel-body info-repo" style="text-align: center;">' + stringCollaborators + '</div></div></div>' + 
                '<div class="col-md-4"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Perfil: </b></div><div class="panel-body info-repo">' + perfilGit + '</div></div></div></div>' +                
                '<div class="row"><div class="col-md-12 readme" class="style-Readme"><div class="panel panel-primary info-repo"><div class="panel-heading title-info-repo"><b>Readme: </b></div><div class="panel-body info-repo">' + decodedReadme + '</div></div></div></div>').appendTo(node);           
                $('#container-main').removeClass("loading");
                $('body').removeClass("stop-scrolling");
            });
        });      
    };

    /* FUNCION PARA MOSTRAR LOS REPOSITORIOS QUE PERTENECEN A UNA CATEGORIA PASADA COMO PARAMETRO */
    function showRepositoriesByCategory(categoryParam,idShowDiv){
        var reposFound = false;
        $('#container-main').addClass("loading");
        $('body').addClass("stop-scrolling");
        var node; 
        //Según el parámetro de 
        var tempRef = new Firebase(nameBBDD + "Categories").orderByChild('name').equalTo(categoryParam).once("child_added", function(snapshot) {
            var reposCategory = snapshot.val();
            var category = reposCategory.id;
            //Solo devuelve un objeto con el id de la categoria y lo usamos para recuperar los repos de la categoria
            var tempRefCat = new Firebase(nameBBDD + "repos").orderByChild('category').equalTo(String(category)).on("value", function(repositories){
                //Creo un contador para colocar tres repositorios por cada fila y otro contador para notificar en un panel
                var cont = 1;
                var total = 0;
                var reposSort = repositories.val();
                var myArray = new Array();
                //Guardo en un array los elementos que se deben visualizar (show=true)
                $.each(reposSort, function(key, value) {
                    if(value.show == true){
                        myArray.push(value);
                    }
                });
                sortRepos(myArray,"updated","desc");
                myArray.forEach(function(repo) {
                    var infoRepo = repo;
                    //if (infoRepo.show == false){
                      //  return;
                    //}  
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
                    $('<div class="panel panel-primary category-repositories" onclick="addIdReposToURL(' + infoRepo.id +')"><div class="panel-heading category-repositories" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin">' + infoRepo.name + '</p></div>' +
                    '<div class="panel-body"><div class="row">' +
                    '<div class="col-md-7"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at) + '</p>' +'<p><b>Fecha Actualización: </b>'+ stringDate(infoRepo.updated_at) + '</p>' +'<p><b>Autores: </b>' + stringCollaborators + '</p></div>' +
                    '<div class="col-md-5"><div class="container-image-categories"><img class="img-responsive" src="' + infoRepo.urlImage + '"></div></div></div></div>').hide().appendTo(node).fadeIn(1000);
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
            $('body').removeClass("stop-scrolling");
        });      
    };

    /* FUNCION PARA MOSTRAR LOS MIEMBROS DE LA ORGANIZACION */
    function showMembers(){
        $('#container-main').addClass("loading");
        $('body').addClass("stop-scrolling");
        node = $('#container-members');
        var tempRef = new Firebase(nameBBDD + "members");
        var total = 0;
        var cont = 1;
        tempRef.on("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                total++;
                node = $("#column-mem-" + cont);
                if (childData.role == "Admin"){
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
            $('body').removeClass("stop-scrolling");
        });    
    };

    /* FUNCION PARA MOSTRAR LOS EQUIPOS DE LA ORGANIZACION */
    function showTeams(){
        $('#container-main').addClass("loading");
        $('body').addClass("stop-scrolling");
        node = $('#container-teams');
        var tempRef = new Firebase(nameBBDD + "teams");
        var total = 0;
        var cont = 1;
        tempRef.on("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                total++;
                node = $("#column-team-" + cont);
                //Entro en bucle con los miembros y monto una cadena  
                var arrayMembers = childData.members;
                var stringMembers1 = "<div class='row'><div class='col-md-6'>";
                var stringMembers2 = "<div class='col-md-6'>"
                var contoColumn = 1;
                for (var p = 0; (p <= arrayMembers.length - 1); p++) {
                    if (contoColumn == 1){
                        stringMembers1 += '<p class="members-teams-left">' + arrayMembers[p] + '</p>';
                        contoColumn = 2;
                    }else{
                        stringMembers2 += '<p class="members-teams-right">' + arrayMembers[p] + '</p>';
                        contoColumn = 1;
                    }
                }; 
                //Añado al final las etiquetas de cierre de los contenedores
                stringMembers1 += '</div>';
                stringMembers2 += '</div></div>';
                //Añado la cabecera desplegable
                $('<div class="jumbotron team-main" data-toggle="collapse" data-target="#div' + childData.id + '"><h4>' + childData.name + '</h4>' +
                '<div class="collapse" id="div' + childData.id + '">' + stringMembers1 + stringMembers2).hide().appendTo(node).fadeIn(1000);
                if ((cont == 1) || (cont == 2)){
                    cont++;
                }else{
                    cont=1;
                }           
            });
            //Informo de la cantidad de miembros y la fecha de actualizacion de los miembros
            getLastUpdatingDateTeams(function(data){
                $("<div class='jumbotron text-black'><h4 class='noRepos'>Existen <b>" + total + "</b> equipos en la cuenta " + cuentaGit + " de GitHub. Actualizado el día " + data.substring(0,10) + " a las " + data.substring(10,16) + " <h4></div>").hide().prependTo($("#title-teams")).fadeIn(500);
            });
            $('#container-main').removeClass("loading");
            $('body').removeClass("stop-scrolling");
        });     
    } 

    /* FUNCION PARA MOSTRAR TODOS LAO REPOSITORIOS EN LA VISTA GLOBAL DE REPOSITORIOS */
    function showAllRepos(){
        hayFiltroRepos = false;
        $('#container-main').addClass("loading");
        $('body').addClass("stop-scrolling");
        $("#container-repositories-all").empty();
        $("#intro-repositorios-all").empty();
        node = $('#container-repositories-all');
        var tempRef = new Firebase(nameBBDD + "repos");
        var total = 0;
        tempRef.on("value", function(snapshot) {
            reposSortGlobal = snapshot.val();
            var myArray = new Array();
            //Guardo en un array los elementos que se deben visualizar (show=true)
            $.each(reposSortGlobal, function(key, value) {
                if(value.show == true){
                    myArray.push(value);
                }
            });
            //Ordenamos los repositorios según el filtro
            sortRepos(myArray,$('#select-order-main').val(),$('#select-order-criterion').val());
            //En este punto ya tenemos un aarray con los elementos ordenados por la fecha de actualizacion en orden decreciente desde la más reciente
            myArray.forEach(function(childSnapshot) {
                var infoRepo = childSnapshot;
                var cat = arrayCategories[infoRepo.category];  
                total++;
               // console.log("Entra bucle " + infoRepo.updated_at);
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
                '<div class="panel-body">' + 
                '<div class="row"><div class="col-md-8"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at) + '</p>' +
                '<p><b>Fecha Actualización: </b>'+ stringDate(infoRepo.updated_at) + '</p>' +
                '<p><b>Categoría: </b>'+ cat + '</p>' +
                '<p><b>Id: </b>'+ infoRepo.id + '</p>' +
                '<p><b>Autores: </b>'+ stringCollaborators + '</p></div>' +
                '<div class="col-md-4"><div class="container-image-all"><img class="img-responsive" src="' + infoRepo.urlImage + '"></div></div></div>' +
                '<div class="row"><div class="col-md-12"><p style="text-align:justify;"><b>Descripción: </b>' + infoRepo.description + '</p></div></div></div></div>').hide().appendTo(node).fadeIn(1000);      
            });
            //Llamamos de manera síncrona a las funciones de obtener las fechas
            getLastUpdatingDate(function(data){
                $("<h4 style='color:black;'>La organización " + cuentaGit + " cuenta con " + total + " repositorios almacenados en GitHub, actualizado el día " + data.substring(0,10) + " a las " + data.substring(10,16) + ".<h4></div>").hide().prependTo($("#intro-repositorios-all")).fadeIn(500);
            });
            $('#container-main').removeClass("loading");
            $('body').removeClass("stop-scrolling");
        });    
    };

    /* FUNCION PARA APLICAR FILTROS SOBRE LA VISTA DE TODOS LOS REPOSITORIOS */
    function filterRepositoriesAll(){
        hayFiltroRepos = true;
        $('#container-main').addClass("loading");
        $("#container-repositories-all").empty();
        $("#resultados-filtros-todos").empty();
        var tempRef = new Firebase(nameBBDD + "repos");
        var total = 0;
        //tempRef.on("value", function(snapshot) {
            //var reposSort = snapshot.val();
            var myArray = new Array();
            //Guardo en un array los elementos que se deben visualizar (show=true) y compruebo los filtros(si existe compruebo que el campo coincida parcialmente)
            $.each(reposSortGlobal, function(key, value) {
                var filNameOk = true;
                var filIdOk = true;
                var filAutorOk = true;
                var filCategoryOk = true;
                var filUpdateOk = true;
                var filCreateOk = true;
                var filDetailDateMonthOk = true;
                var filDetailDateYearOk = true;
                var filtrofechaDetalle = false;
                //Guardo los colaboradores (se necesita par el filtro):
                var arrayCollaborators = value.collaborators;
                var stringCollaborators  = "";
                console.log(arrayCollaborators);
                for (var p = 0; (p <= arrayCollaborators.length - 1); p++) {
                    if (p == arrayCollaborators.length - 1){
                        stringCollaborators += arrayCollaborators[p];
                    }else{
                        stringCollaborators += arrayCollaborators[p] + " | ";
                    }
                };
                if(value.show == true){             
                    //NOMBRE
                    if ($('#filtroNombreTodos').val() != ''){
                        if ((value.name).toUpperCase().indexOf($('#filtroNombreTodos').val().toUpperCase()) == -1){
                            filNameOk = false;
                        }
                    }
                    //ID
                    if ($('#filtroIdTodos').val() != ''){
                        if (String(value.id).indexOf($('#filtroIdTodos').val()) == -1){
                            filIdOk = false;
                        }
                    }
                    //AUTOR
                    if ($('#filtroAutorTodos').val() != ''){
                        if ((stringCollaborators).toUpperCase().indexOf($('#filtroAutorTodos').val().toUpperCase()) == -1){
                            filAutorOk = false;
                        }
                    }
                    //CATEGORIA
                    if ($('#select-categoria-filter').val() != 0){
                        if (value.category != $('#select-categoria-filter').val()){
                            filCategoryOk = false;
                        }
                    }
                    //FECHA ACTUALIZACION
                    if ($("#datetimepicker-update-value").val() != ''){
                        if (stringDate(value.updated_at).substring(0,10) != $("#datetimepicker-update-value").val().replace(/[\/]/g,'-')){
                            filtrofechaDetalle = true;
                            filUpdateOk = false;
                        }
                    }
                    //FECHA CREACION
                    if ($("#datetimepicker-creation-value").val() != ''){
                        $("#select-date-main").val(0);
                        if (stringDate(value.created_at).substring(0,10) != $("#datetimepicker-creation-value").val().replace(/[\/]/g,'-')){
                            filCreateOk = false;
                            filtrofechaDetalle = true;
                        }
                    }
                    //Comprueba si hay filtro específico de fecha. Si no lo hay aplica los rangos
                    if (filtrofechaDetalle == false){
                        if (($("#select-date-main").val() != 0) && (($("#select-date-year").val() != 0) || ($("#select-date-month").val() != 0))){
                            var mainDate = $("#select-date-main").val()
                            var fechaFilter;
                            if (mainDate == "updated"){fechaFilter = stringDate(value.updated_at);}else{fechaFilter = stringDate(value.created_at);}                     
                            if (($("#select-date-month").val() != 0) && (fechaFilter.substring(3,5) != $("#select-date-month").val())){
                                filDetailDateMonthOk = false;
                            }
                            if (($("#select-date-year").val() != 0) && (fechaFilter.substring(6,10) != $("#select-date-year").val())){
                                filDetailDateYearOk = false;                              
                            }
                        }
                    }
                    //Comprobamos los booleanos y si todos son true, guardamos l repositorio para mostrarlo
                    if (filNameOk && filIdOk && filCreateOk && filCategoryOk && filAutorOk && filUpdateOk && filDetailDateMonthOk && filDetailDateYearOk){
                        myArray.push(value);
                    }
                }
            });
            sortRepos(myArray,$('#select-order-main').val(),$('#select-order-criterion').val());
            //En este punto ya tenemos un aarray con los elementos ordenados por la fecha de actualizacion en orden decreciente desde la más reciente
            myArray.forEach(function(childSnapshot) {
                var infoRepo = childSnapshot;
                var arrayCollaborators = infoRepo.collaborators;
                var stringCollaborators  = "";
                for (var p = 0; (p <= arrayCollaborators.length - 1); p++) {
                    if (p == arrayCollaborators.length - 1){
                        stringCollaborators += arrayCollaborators[p];
                    }else{
                        stringCollaborators += arrayCollaborators[p] + " | ";
                    }
                };
                var cat = arrayCategories[infoRepo.category];  
                total++; 
                $('<div class="panel panel-primary category-repositories all" onclick="addIdReposToURL(' + infoRepo.id +')"><div class="panel-heading category-repositories" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin">' + infoRepo.name + '</p></div>' +
                '<div class="panel-body">' + 
                '<div class="row"><div class="col-md-8"><p><b>Fecha Creación: </b>'+ stringDate(infoRepo.created_at) + '</p>' +
                '<p><b>Fecha Actualización: </b>'+ stringDate(infoRepo.updated_at) + '</p>' +
                '<p><b>Categoría: </b>'+ cat + '</p>' +
                '<p><b>Id: </b>'+ infoRepo.id + '</p>' +
                '<p><b>Autores: </b>'+ stringCollaborators + '</p></div>' +
                '<div class="col-md-4"><div class="container-image-all"><img class="img-responsive" src="' + infoRepo.urlImage + '"></div></div></div>' +
                '<div class="row"><div class="col-md-12"><p style="text-align:justify;"><b>Descripción: </b>' + infoRepo.description + '</p></div></div></div></div>').hide().appendTo(node).fadeIn(1000);   
            });
            if (total == 1){
                $("<p style='font-size:16px;'><b>" + total +" resultado</b><p>").hide().prependTo($("#resultados-filtros-todos")).fadeIn(500);
            }else if(total == 0){
                $("<h3 class='noRepos'>Ningún repositorio coincide con la búsqueda<h3>").hide().appendTo(node).fadeIn(500);
                $("<p style='font-size:16px;'><b>" + total +" resultados</b><p>").hide().prependTo($("#resultados-filtros-todos")).fadeIn(500);
            }else{
                $("<p style='font-size:16px;'><b>" + total +" resultados</b><p>").hide().prependTo($("#resultados-filtros-todos")).fadeIn(500);
            }
            $('#container-main').removeClass("loading");
        //});    
    }

	/* FUNCION PARA VACIAR LOS FILTROS DEL CONTENEDOR DE FILTRAR EN LA VISTA DE TODOS OS REPOSITORIOS */
    function filterOffAll() {
        $("#resultados-filtros-todos").empty();
        //Vacia los inputs de búsqueda de nombre,id,autor y fechas
        $('.filter-all').val("");
        //Elimina la selección de categoría, y fecha detalle
        $('#select-categoria-filter').val(0);
        $('#select-date-main').val(0);
        $('#select-date-month').val(0);
        $('#select-date-year').val(0);
        $("#select-date-month").attr('disabled', true);
        $("#select-date-year").attr('disabled', true);  
        //LLamamos a la funcion que recraga todos sin filtros
        showAllRepos();
    }

