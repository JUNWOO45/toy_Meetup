export function consistFavoriteMeetupStorage(favoriteMeetupStorage, currentFavoriteList) {
    for(let i = 0; i < Object.keys(favoriteMeetupStorage).length; i++) {
        currentFavoriteList.innerHTML += `<div id = "favoriteList"> - <a href = ${favoriteMeetupStorage[Object.keys(favoriteMeetupStorage)[i]]} target="_blank">${Object.keys(favoriteMeetupStorage)[i]}</a><span class = "deleteFavorite">&times;</span></div>`;
    }
}
