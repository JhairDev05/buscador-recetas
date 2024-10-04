function iniciarApp() {

    const selectCategories = document.querySelector('#categorias');
    const resultado = document.querySelector('#resultado');

    if(selectCategories) {
        selectCategories.addEventListener('change', selectGategory);
        getCategories();
    }

    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv) {
        obtenerFavoritos();
    }

    const modal = new bootstrap.Modal('#modal', {});

    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                showCategories(data.categories);
            });
    }

    function showCategories( categories = [] ) {
        categories.forEach( categorie => {
            const { strCategory } = categorie;

            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategories.appendChild(option);
        })
    }

    function selectGategory(e) {
        const category = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

        fetch(url)
            .then( response => {
                return response.json();
            })
            .then( data => {
                showRecetas(data.meals);
            })
    }

    function showRecetas(recetas = []) {

        // Limpiar el HTML
        limpiarHTML(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados' : 'No hay resultados';
        // if(recetas.length > 0 ) {
        //     heading.textContent = 'Resultados';
        // } else {
        //     heading.textContent = 'No hay resultados';
        // }
        resultado.appendChild(heading);

        // Iterar en los resultados
        recetas.forEach( receta => {
            const { idMeal, strMeal, strMealThumb } = receta;
    
            const divReceta = document.createElement('DIV');
            divReceta.classList.add('col-md-4');
    
            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');
    
            const recetaImage = document.createElement('IMG');
            recetaImage.classList.add('card-img-top');
            recetaImage.alt = `Imagen de la receta ${strMeal ?? receta.title}`;
            recetaImage.src = strMealThumb ?? receta.img; // Revisa si el primer valor existe, sino existe, entonces que le agregue lo que tenemos en localStorage
    
            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');
    
            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.title;
    
            const recetaBtn = document.createElement('BUTTON');
            recetaBtn.classList.add('btn', 'btn-danger', 'w-100');
            recetaBtn.textContent = 'Ver receta';
            // recetaBtn.dataset.bsTarget = "#modal";
            // recetaBtn.dataset.bsToggle = "modal";
            recetaBtn.onclick = function() {
                selectReceta(idMeal ?? receta.id);
            } // Usamos onclick porque en este caso el elemento no aparece al principio, sino después de que el usuario seleccione una categoría
    
            // Inyectar en el código HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaBtn);
    
            recetaCard.appendChild(recetaImage);
            recetaCard.appendChild(recetaCardBody);
    
            divReceta.appendChild(recetaCard);
    
            resultado.appendChild(divReceta); // Tiene que haber un elemento en el HTML creado para que puedas agregar el contenido
        })
    }

    function selectReceta(idMeal) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`;

        fetch(url)
            .then( response => {
                return response.json();
            })
            .then( data => {
                showRecetaModal(data.meals[0]);
            })
    }

    function showRecetaModal(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        // Agregar contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        
        // Limpiar HTML
        limpiarHTML(modalBody);

        modalTitle.textContent = strMeal;

        const imageBody = document.createElement('IMG');
        imageBody.classList.add('img-fluid');
        imageBody.src = strMealThumb;
        imageBody.alt = `receta ${strMeal}`;

        const heading = document.createElement('H3');
        heading.classList.add('my-3');
        heading.textContent = 'Instrucciones';

        const instrucciones = document.createElement('P');
        instrucciones.textContent = strInstructions;

        const ingredientesCant = document.createElement('H3');
        ingredientesCant.classList.add('my-3');
        ingredientesCant.textContent = 'Ingredientes y Cantidades';

        modalBody.appendChild(imageBody);
        modalBody.appendChild(heading);
        modalBody.appendChild(instrucciones);
        modalBody.appendChild(ingredientesCant);

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // Mostrar cantidades e ingredientes
        for(let i = 1; i <= 20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLi);

                console.log();
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');

        limpiarHTML(modalFooter);

        // Botones de cerrar y favorito
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar favorito' : 'Guardar favorito';

        // LocalStorage
        btnFavorito.onclick = function() {

            if(existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar favorito';
                mostrarToast('Eliminado correctamente');
                return;
            }

            agregarFavorito({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar favorito';
            mostrarToast('Agregado correctamente');
        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function() {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        // Muestra el modal
        modal.show();
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);

        toastBody.textContent = mensaje;
        toast.show();
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length) {
            showRecetas(favoritos);
            return;
        }

        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'Aún no hay favoritos';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritosDiv.appendChild(noFavoritos);
    }

    function limpiarHTML(selector) {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener('DOMContentLoaded', iniciarApp);