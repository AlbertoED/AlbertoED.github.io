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
        loadingProjects = true;
        var target = this;
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
                        //Las columnas deben sumar 12. Anidamos los contenedores para cada proyecto que nos devuelva el GET:
                        $('<div class="panel panel-primary"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin"><a href="' + this.html_url + '" target="_blank">' + this.name + '</a></p></div>' +
                        '<div class="panel-body"><div class="row"><div class="col-md-2"><p><b>Autor: </b>'+ this.owner.login + '</p></div>' + 
                        '<div class="col-md-3"><p><b>Fecha Creación: </b>'+ fechaIn + '</p></div>' +
                        '<div class="col-md-5"><p><b>Categoría: </b><select id="select' + this.id + '"><option hidden value="0">Seleccione una categoría</option><option value="1">Agentes y Simulación Social</option><option value="2">Big Data y Aprendizaje Automático</option><option value="3">NLP y Análisis de Sentimientos</option><option value="4">La Web de Datos y Tecnologías Semánticas</option><option value="5">Ingeniería Web y de servicios</option><option value="6">Otros</option></select></p></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox"  id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Descripción: </b>' + description + '</div></div></div>').hide().appendTo(node).fadeIn(800);
                        //Incluimos efecto de fade in para los nuevos repositoios que se muestran
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
        });
    };

    // FUNCION QUE TOMA COMO PARAMETRO DE ENTRADA UNA STRING DE FECHA (10) Y LO DEVUELVE EN OTRO FORMATO
    function stringDate(date) {
        return (date.substring(8,10) + '-' + date.substring(5,7) + '-' + date.substring(0,4));
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

    // FUNCION QUE MUESTRA POR CONSOLA EL ID DE LOS TOGGLES QUE ESTAN EN ESTADO ON
    function guardarSeleccion(){
        var readme;
        var id;
        var category;
        var showRepo;
        var reposRef = myDataRef.child("repos");
        // Buscamos todos los paneles existentes (1 panel= 1 repositorio). De cada uno realizamos una petición de info a GitHub.
        // Guardamos los datos que queremos mostrar posteriormente y la categoria y 'mostrar' especificados
        $(".titleReposAdmin").each(function(){



            //Guardamos los colaboradores
            //https://api.github.com/repos/AlbertoED/AlbertoED.github.io/collaborators?&access_token=733cbc328a460a6cd0238dbd74f09eba4721e57f
            //tamaño en KB


        
            jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + $(this).text() + '?&access_token=' + tokenGit, function (data) {
                //Guardamos la categoria y mostrar en dos variables
                    id = "#select" + data.id;
                    category = $(id).prop('value');
                    id = "#toggle" + data.id;

                    showRepo = $(id).prop('checked');
                    console.log(showRepo);
                    console.log(category);

                //Recuperamos el readme, si tiene, y lo guardamos codificado (decodificamos al mostrarlo):
                if (data.has_wiki == true){  
                     jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + data.name + '/readme?access_token=' + tokenGit, function (dataReadme) {                       
                        readme = dataReadme.content;
                        reposRef.child(data.id).set({
                            name: data.name,
                            owner: data.owner.login,
                            html_url: data.html_url,
                            description: data.description,
                            created_at: data.created_at,
                            updated_at: data.updated_at,
                            size: data.size,
                            readme: readme,
                            category: category,
                            show: showRepo 
                        });          
                    });
                }else{
                    readme = '-';
                    reposRef.child(data.id).set({
                        name: data.name,
                        owner: data.owner.login,
                        html_url: data.html_url,
                        description: data.description,
                        created_at: data.created_at,
                        updated_at: data.updated_at,
                        size: data.size,
                        readme: readme,
                        category: category,
                        show: showRepo   
                    }); 
                } 
            });                  
        });

        //$(".toggle").not(".off").children("input").each(function(){                
        //});
        $('#confirmar-guardar').modal('hide');
    };

    jQuery.gitUser = function (callback) {
        jQuery.getJSON('https://api.github.com/users/' + cuentaGit + '/repos?per_page=9&access_token=' + tokenGit + '&page=' + currentPage + '&callback=?', callback);
        //jQuery.getJSON('https://api.github.com/users/gsi-upm/repos?per_page=7&page=' + currentPage + '&callback=?', callback);  //Change per_page according to your need.
        //console.log('https://api.github.com/users/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?');
    };

    /* FUNCION PARA PEDIR EL README DEL PROYECTO */
    jQuery.gitReadme = function(repositorio,callback) {
        jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + repositorio + '/readme?access_token=' + tokenGit + '&callback=?', callback);
        console.log(repositorio);
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
        getTokenFireBase();
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
