 // Para referenciar a nuestra app de FireBase
    var myDataRef = new Firebase('https://shining-torch-549.firebaseio.com/');
    var cuentaGit = "albertoed"; 
    var tokenGit;
    var currentPage = 1;
    var loadingProjects = true;
    var stopLoadingProjects = false;

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
        var repos = data.data; // JSON Parsing
                /*var reposRef = myDataRef.child("repos");
                reposRef.set(repos);*/
                console.log(repos.length); //Only for checking how many items are returned.
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
                        node.append('<div class="panel panel-primary"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin"><a href="' + this.html_url + '" target="_blank">' + this.name + '</a></p></div>' +
                        '<div class="panel-body"><div class="row"><div class="col-md-2"><p><b>Autor: </b>'+ this.owner.login + '</p></div>' + 
                        '<div class="col-md-3"><p><b>Fecha Creación: </b>'+ fechaIn + '</p></div>' +
                        '<div class="col-md-5"><p><b>Categoría: </b><select><option hidden >Seleccione una categoría</option><option>Agentes y Simulación Social</option><option>Big Data y Aprendizaje Automático</option><option>NLP y Análisis de Sentimientos</option><option>La Web de Datos y Tecnologías Semánticas</option><option>Ingeniería Web y de servicios</option><option>Otros</option></select></p></div> ' +
                        '<div class="col-md-2"><p><b>¿Mostrar?: </b><input data-toggle="toggle" type="checkbox"  id="toggle' + this.id + '"></p></div></div>' +
                        '<div class="row"><div class="col-md-2"><p><b>ID: </b>' + this.id + '</p></div>' +
                        '<div class="col-md-8"><b>Descripción: </b>' + description + '</div></div></div>');
                    }
                });
                //CUANDO TERMINE DE CARGAR LOS REPOSITORIOS EL BOTON DE GUARDAR SERÁ VISIBLE
                $('#btnGuardarRepositorios').show();
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
        $(".toggle").not(".off").children("input").each(function(){
             console.log($(this).attr('id'));                 
        });
        $('#confirmar-guardar').modal('hide');
    };

    jQuery.gitUser = function (callback) {
        jQuery.getJSON('https://api.github.com/users/' + cuentaGit + '/repos?per_page=1&access_token=' + tokenGit + '&page=' + currentPage + '&callback=?', callback); //Change per_page according to your need.
        console.log('https://api.github.com/users/' + cuentaGit + '/repos?per_page=1000&access_token=' + tokenGit + '&callback=?');
    };

    jQuery.gitReadme = function(repositorio,callback) {
            jQuery.getJSON('https://api.github.com/repos/' + cuentaGit + '/' + repositorio + '/readme?access_token=f0b6a501c4e4fa1ea5cb289b26a293dccdde879d&callback=?', callback)
            //SE USARA PARA LA INFO COMPLETA DE CADA PROYECTO
                     //Realizamos una petición GET del readme del proyecto
                $.gitReadme(this.name, function (data) {
                var file = data.data;

                console.log(decodeURIComponent(escape(window.atob(file.content))));
        });
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

        });
    });

    //FUNCIÓN PARA MOSTRAR TANTOS PROYECTOS COMO QUEPAN EN LA PANTALLA
    function loadMore() {
        console.log("entra click");
        currentPage++;
        $("#display-projects").cargaRepositoriosGithub();
    };
