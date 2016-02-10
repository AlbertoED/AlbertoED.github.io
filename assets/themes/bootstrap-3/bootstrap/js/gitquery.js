 // Para referenciar a nuestra app de FireBase
    var myDataRef = new Firebase('https://shining-torch-549.firebaseio.com/');
    var cuentaGit = "gsi-upm"; 
    var tokenGit;
    var currentPage = 1;
    var loadingProjects = true;
    var stopLoadingProjects = false;
    // Variable publica para almacenar los repositorios devueltos por github
    var repos;

    //eN CASO DE FALLO QUE MUESTRE UN MENSAJE DE ERROR EN LA CARGA
    jQuery.fn.cargaRepositoriosGithub = function () {
        if (loadingProjects || stopLoadingProjects){
            return;
        }
        var description;
        var fechaIn;
        var privacidad;
        var target = this;
        loadingProjects = true;
        //Recuperamos el Token para poder utilizar GET en el github con los permisos de visualizar repositorios privados y públicos
        console.log(tokenGit);
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
                        '<div class="col-md-2"><b>' + privacidad + '</b></div></div></div>').hide().appendTo(node).fadeIn(1000);
                        //Incluimos efecto de fade in para los nuevos repositoios que se muestran
                        //Comprobamos si ya hay datos guardados en Firebase para cada repositorio
                        myDataRef.once("value", function(snapshot) {
                            var elementFirebase = snapshot.child("repos/" + IDRepo).exists();
                            console.log(IDRepo + " en firebase: " + elementFirebase);
                            //Si está en Firebase, recuperamos el valor del select y del toggle y los asignamos al panel del repositorio
                            if (elementFirebase == true){
                                refTemp = new Firebase('https://shining-torch-549.firebaseio.com/repos/' + IDRepo);
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
                //CUANDO TERMINE DE CARGAR LOS REPOSITORIOS LOS BOTONES DE GUARDAR SERÁN VISIBLE
                $('#btnGuardarRepositorios-arriba').show();
                $('#btnGuardarRepositorios-abajo').show();
                //IMPORTANTE: esta linea transforma todos los checkboxes que hemos añadido al html en los toggles
                $('input[type="checkbox"]').bootstrapToggle({
                        on: 'Sí',
                        off: 'No'
                });
                //...
                loadingProjects = false;
                $('#fecha-actualizacion').hide().html('Fecha de actualización: <b>' + getActualDatetime() + '</b>').fadeIn(500);
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
        refTemp = new Firebase('https://shining-torch-549.firebaseio.com/Tokens');
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

    /* FUNCION PARA GUARDAR LOS REPOSITORIOS EN FIREBASE */
    function guardarSeleccion(){
        var reposRef = myDataRef.child("repos")
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
                            }else{
                                var Readme = responseReadme.data.content;
                            }   
                            reposRef.child(responseRepoInfo.data.id).set({
                                name: responseRepoInfo.data.name,
                                owner: responseRepoInfo.data.owner.login,
                                html_url: responseRepoInfo.data.html_url,
                                description: responseRepoInfo.data.description,
                                created_at: responseRepoInfo.data.created_at,
                                updated_at: responseRepoInfo.data.updated_at,
                                size: responseRepoInfo.data.size,
                                readme: Readme,
                                category: categoryRepo,
                                show: showRepo,
                                language: responseRepoInfo.data.language,
                                collaborators: collaboratorsRepo,
                                private: responseRepoInfo.data.private,
                                download_zip_url: "https://github.com/" + cuentaGit + "/" + responseRepoInfo.data.name + "/archive/" + responseRepoInfo.data.default_branch + ".zip"
                            });                  
                        });                    
                    });
                });
            });
            //Cerramos el modal
            $('#confirmar-guardar').modal('hide');
        };
        /* MOSTRAR LOS MIEMBROS DE LA ORGANIZACION
        https://api.github.com/orgs/gsi-upm/members?&access_token=...
        https://api.github.com/orgs/gsi-upm/members?&access_token=...&page=2 
    
        MOSTRAR INFO DE LA ORG
        https://api.github.com/orgs/gsi-upm?&access_token=...
        
        MOSTRAR LOS EQUIPOS
        https://api.github.com/orgs/gsi-upm/teams?&access_token=...
         */

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

    function funcionPost() {
        myDataRef.on("value", function(snapshot) {
                console.log(snapshot.val());
                }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                });
           /* var reposRef = myDataRef.child("repos");
            reposRef.set*/
    };

    // CODIGO QUE SE EJECUTA CUANDO YA SE HA CARGADO LA PÁGINA
    $(window).load(function(){
        var rutaEntera = window.location.pathname;
        var urlPag = rutaEntera.split("/").pop();
        if (urlPag == "archive.html" || urlpag == "archive"){
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

    /* FUNCION PARA DECODIFICAR EL README QUE ESTA CODIFICADO EN base64 */
    function decodeBase64(string) {
         return decodeURIComponent(escape(window.atob(string)));   
    };
    
    //FUNCIÓN PARA MOSTRAR TANTOS PROYECTOS COMO QUEPAN EN LA PANTALLA
    function loadMore() {
        console.log("entra click");
        currentPage++;
        $("#display-projects").cargaRepositoriosGithub();
    };
