    // Para referenciar a nuestra app de FireBase
    var nameBBDD = "https://shining-torch-549.firebaseio.com/";
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
    //Variable paraalmacenar los repositorios devueltos por Firebase y sólo tener que llamarlos una vez
    var reposSortGlobal;
    var hayFiltroRepos = false;
    //LOGIN
    //Para almacenar el nombre del usuario que se ha conectado
    var nombreUsuario;
    //Variable booleana que marca el fin de la sesion
    var finSesionManual = false;

    /* CODIGO QUE SE EJECUTA CUANDO YA SE HA CARGADO LA PÁGINA */
    $(window).load(function(){
        var rutaEntera = window.location.pathname;
        var urlPag = rutaEntera.split("/").pop();
        if (urlPag == "admin.html" || urlPag == "admin"){
            $('#container-main').addClass("loading");
            getTokenFireBase(function(){
                getCategories(function(){
                    loadRepositoriesGithub();
                });               
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
  
    /* FUNCION QUE TOMA COMO PARAMETRO DE ENTRADA UNA STRING DE FECHA Y LO DEVUELVE EN OTRO FORMATO */
    function stringDate(date) {

        return (date.substring(8,10) + '-' + date.substring(5,7) + '-' + date.substring(0,4) +' ' + date.substring(11,13) + ':' + date.substring(14,16));
    }; 

    /* FUNCION QUE DEVUELVE LA FECHA ACTUAL PARA MOSTRAR EN LA WEB  */
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

    /* FUNCION PARA RECUPERAR ULTIMA FECHA DE MODIFICACION DE LOS EQUIPOS */
    function getLastUpdatingDateTeams(callback) {
        refTemp = new Firebase(nameBBDD + 'info-web/updated_date_teams');
        refTemp.on("value", function(snapshot) {
                var lastDate = snapshot.val();
                callback(lastDate);
        });
    };

    /* FUNCION PARA ORDENAR EL ARRAY DE REPOSITORIOS PASADO COMO PARAMETRO */
    function sortRepos(repos,main,criterion) {
        switch(main) {
            case "updated":
                if (criterion == "desc"){
                    repos.sort(function (a, b) {
                        return new Date(b.updated_at) - new Date(a.updated_at);
                    });
                }else{
                    repos.sort(function (a, b) {
                        return new Date(a.updated_at) - new Date(b.updated_at);
                    });
                }
                break;
            case "created":
                if (criterion == "desc"){
                    repos.sort(function (a, b) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    });
                }else{
                    repos.sort(function (a, b) {
                        return new Date(a.created_at) - new Date(b.created_at);
                    });
                }
                break;
            case "name":
                if (criterion == "desc"){
                    repos.sort(function (a, b) {
                        return b.name.localeCompare(a.name);
                    });
                }else{
                    repos.sort(function (a, b) {
                        return a.name.localeCompare(b.name);                    
                    });
                }
                break;        
        }
    }

    /* FUNCION PARA VOLVER A LA PAGINA ANTERIOR */
    function goBack(){

        window.history.back(); 
    }

    /* FUNCION PARA DECODIFICAR EL README QUE ESTA CODIFICADO EN Base64 */
    function decodeBase64 (string){

         return decodeURIComponent(escape(window.atob(string)));   
    };

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

    /* FUNCION PARA MONTAR LA URL CON EL IDENTIFICADOR DEL REPOSITORIO */
    function addIdReposToURL(idRepo){
        reposUrl = "/Repositorio.html?";
        reposUrl = reposUrl + "&id=" + idRepo;
        window.location.href = reposUrl;
    }

    /* FUNCION PARA CONTROLAR LA ORDENACION DE LOS REPOSITORIOS */
    function orderRepos() {
        if (hayFiltroRepos == true){
            filtrarTodos()
        }else{
            showAllRepos()
        }
    }
