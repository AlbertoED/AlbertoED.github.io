    // Para referenciar a nuestra app de FireBase
    var myDataRef = new Firebase('https://shining-torch-549.firebaseio.com/');
    var cuentaGit = "albertoed"; 

    jQuery.gitUser = function (callback) {
        jQuery.getJSON('https://api.github.com/users/' + cuentaGit + '/repos?per_page=1000&&access_token=f0b6a501c4e4fa1ea5cb289b26a293dccdde879d&callback=?', callback) //Change per_page according to your need.
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

    jQuery.fn.cargaRepositoriosGithub = function () {
        var target = this;
        $.gitUser(function (data) {
        var repos = data.data; // JSON Parsing
                /*var reposRef = myDataRef.child("repos");
                reposRef.set(repos);*/
                console.log(repos.length); //Only for checking how many items are returned.
                //sortByForks(repos); //Sorting by forks. You can customize it according to your needs.
                //var list = $('<dl/>');
                //target.empty().append(list);
                var node = document.getElementById('display-projects');
                $(repos).each(function () {
                    checkfork = this.fork;
                    if (this.name != (cuentaGit.toLowerCase() + '.github.io')){ //Check for cuentaGit.github.com repo and for forked projects
                        //list.append('<dt><a style="font-size:20px;" href="' + (this.homepage ? this.homepage : this.html_url) + '">' + this.name + '</a><em> - ' + (this.language ? ('(' + this.language + ')') : '') + '</em><br>Forks: ' + this.forks + ' | Watchers: ' + this.watchers + '</dt>');

                        // Anidamos los contenedores para cada proyecto que nos devuelva el GET:

                       node.innerHTML += '<div class="panel panel-primary"><div class="panel-heading" style="background-color: #0683AD;background-image: none;"><p class="titleReposAdmin">' + this.name + 
                       '</p></div><div class="panel-body"><div class="row"><div class="col-md-2"><p><b>Autor: </b>'+ this.owner.login + '</p></div>' + 
                       '<div class="col-md-4"><p><b>Fecha Creación: </b>'+ this.created_at + '</p></div>' +
                       '<div class="col-md-5"><p><b>Categoría: </b><select><option hidden >Seleccione una categoría</option><option>Agentes y Simulación Social</option><option>Big Data y Aprendizaje Automático</option><option>NLP y Análisis de Sentimientos</option><option>La Web de Datos y Tecnologías Semánticas</option><option>Ingeniería Web y de servicios</option><option>Otros</option></select></p></div>' +
                       '<div class="col-md-1"><input data-toggle="toggle" type="checkbox" id="toggle' + this.id + '"></div></div></div></div>';
       
                    }
                });
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
