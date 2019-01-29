import 'styles/index.less';
import $ from 'jquery';
import {consistFavoriteMeetupStorage} from './test';

let markerOnTheGoogleMap;
const initialRenderPosition = {
    zoom : 10,
    center : new google.maps.LatLng(37.40, 127.01)
};
let map = new google.maps.Map(document.querySelector("#map"), initialRenderPosition);
const currentFavoriteList = document.querySelector("#favoriteContainer");
const favoriteMeetupStorage = localStorage;
favoriteMeetupStorage.removeItem("loglevel:webpack-dev-server");

// function consistFavoriteMeetupStorage() {
//     for(let i = 0; i < Object.keys(favoriteMeetupStorage).length; i++) {
//         currentFavoriteList.innerHTML += `<div id = "favoriteList"> - <a href = ${favoriteMeetupStorage[Object.keys(favoriteMeetupStorage)[i]]} target="_blank">${Object.keys(favoriteMeetupStorage)[i]}</a><span class = "deleteFavorite">&times;</span></div>`;
//     }
// }
consistFavoriteMeetupStorage(favoriteMeetupStorage, currentFavoriteList);

google.maps.event.addListener(map, "click", function(event) {
    stampMarkerOnTheMap(event.latLng);
    makeMeetupList(markerOnTheGoogleMap.position.lat(), markerOnTheGoogleMap.position.lng());
});

function stampMarkerOnTheMap(location) {
    if(markerOnTheGoogleMap) {
        markerOnTheGoogleMap.setPosition(location);
    } else {
        markerOnTheGoogleMap = new google.maps.Marker({
            position : location,
            map : map
        });
    }
}

function makeMeetupList(lat, lon) {
    $.get({
        url : `https://api.meetup.com/find/upcoming_events?photo-host=public&page=20&sig_id=271259746&fields=event_hosts&lon=${lon}&lat=${lat}&sig=95154273bf3ffe75dcba181fa667a63a7e55ac74`,
        type : "GET",
        dataType : "jsonp"
    }).done(function(data) {
        const nearbyMeetupList = document.querySelector("#nearbyMeetupList");

        if(data.data.events){
            nearbyMeetupList.innerHTML = "";

            data.data.events.forEach(function(dataFromMeetupAPI) {
                const div = document.createElement("div");
                if(Object.keys(favoriteMeetupStorage).includes(dataFromMeetupAPI.name)) {
                    div.classList.add("added-favorite");
                } else {
                    div.classList.add("meetup-information");
                }
                nearbyMeetupList.appendChild(div);

                const meetupTitle = document.createElement("div");
                meetupTitle.classList.add("meetup-title");
                if(Object.keys(favoriteMeetupStorage).includes(dataFromMeetupAPI.name)) {
                    meetupTitle.innerHTML = `<img src = "favorite.png" class = "favorite-border"></img> <p><a href = ${dataFromMeetupAPI.link} target="_blank">${dataFromMeetupAPI.name}</a></p>`;
                } else {
                    meetupTitle.innerHTML = `<img src = "favorite-border.png" class = "favorite-border"></img> <p><a href = ${dataFromMeetupAPI.link} target="_blank">${dataFromMeetupAPI.name}</a></p>`;
                }
                div.appendChild(meetupTitle);
                
                const notPaintedFavorite = document.querySelectorAll(".favorite-border");
                notPaintedFavorite[notPaintedFavorite.length - 1].addEventListener("click", function(e) {
                    currentFavoriteList.innerHTML = "";
                    if(e.target.src === "http://localhost:8080/favorite-border.png") {
                        e.target.parentNode.parentNode.classList.add("added-favorite");
                        e.target.parentNode.parentNode.classList.remove("meetup-information");
                        e.target.src = "favorite.png";
                        favoriteMeetupStorage.removeItem("loglevel:webpack-dev-server");
                        favoriteMeetupStorage.setItem(e.target.parentNode.lastChild.innerText, dataFromMeetupAPI.link);
                        const favoriteBtnToRewind = e.target;

                        for(let i = 0; i < Object.keys(favoriteMeetupStorage).length; i++) {
                            currentFavoriteList.innerHTML += `<div id = "favoriteList"> - <a href = ${favoriteMeetupStorage[Object.keys(favoriteMeetupStorage)[i]]} target="_blank">${Object.keys(favoriteMeetupStorage)[i]}</a><span class = "deleteFavorite">&times;</span></div>`;
                            document.querySelectorAll(".deleteFavorite").forEach(function(e) {
                                e.addEventListener("click", function(e) {
                                    favoriteBtnToRewind.src = "favorite-border.png";
                                    favoriteBtnToRewind.parentNode.parentNode.classList.add("meetup-information");
                                    favoriteBtnToRewind.parentNode.parentNode.classList.remove("added-favorite");
                                    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                                    favoriteMeetupStorage.removeItem(e.target.parentNode.childNodes[1].innerText);
                                });
                            });
                        }
                    } else {
                        e.target.parentNode.parentNode.classList.add("meetup-information");
                        e.target.parentNode.parentNode.classList.remove("added-favorite");
                        e.target.src = "favorite-border.png";
                        favoriteMeetupStorage.removeItem(e.target.parentNode.lastChild.innerText);

                        for(let i = 0; i < Object.keys(favoriteMeetupStorage).length; i++) {
                            currentFavoriteList.innerHTML += `<div id = "favoriteList"> - <a href = ${favoriteMeetupStorage[Object.keys(favoriteMeetupStorage)[i]]} target="_blank">${Object.keys(favoriteMeetupStorage)[i]}</a><span class = "deleteFavorite">&times;</span></div>`;
                            document.querySelectorAll(".deleteFavorite").forEach(function(e) {
                                e.addEventListener("click", function(e) {
                                    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                                    favoriteMeetupStorage.removeItem(e.target.parentNode.childNodes[1].innerText);
                                });
                            });
                        }
                    }
                });

                const meetupTime = document.createElement("div");
                meetupTime.classList.add("meetup-time");
                let convertedTime = new Date(dataFromMeetupAPI.time);
                meetupTime.innerHTML = (convertedTime+"").split(" ").slice(0, 5).join(" ");
                div.appendChild(meetupTime);

                const meetupPlace = document.createElement("div");
                meetupPlace.classList.add("meetup-place");
                if(dataFromMeetupAPI.venue) {
                    if(dataFromMeetupAPI.venue.hasOwnProperty("address_2")) {
                        meetupPlace.innerHTML = dataFromMeetupAPI.venue.address_2 + " " + dataFromMeetupAPI.venue.address_1;
                    } else {
                        meetupPlace.innerHTML = dataFromMeetupAPI.venue.address_1 + " " + dataFromMeetupAPI.venue.name;
                    }
                } else {
                    meetupPlace.innerHTML = "There is no place information";
                }
                div.appendChild(meetupPlace);

                const meetupRsvp = document.createElement("div");
                meetupRsvp.classList.add("meetup-rsvp");
                meetupRsvp.innerHTML = "확정인원 :  " + dataFromMeetupAPI.yes_rsvp_count;
                div.appendChild(meetupRsvp);

                const meetupGroupName = document.createElement("div");
                meetupGroupName.classList.add("meetup-group-name");
                meetupGroupName.innerHTML = dataFromMeetupAPI.group.name;
                div.appendChild(meetupGroupName);

                if(dataFromMeetupAPI.event_hosts) {
                    dataFromMeetupAPI.event_hosts.forEach(function(data) {
                        const hostInformation = document.createElement("div");
                        hostInformation.classList.add("host-information");
                        if(data.photo) {
                            hostInformation.innerHTML = `<img src = ${data.photo.thumb_link}></img> ${data.name}`;
                            div.appendChild(hostInformation);
                        } else {
                            hostInformation.innerHTML = "There is no host picture";
                            div.appendChild(hostInformation);
                        }
                    });
                } else {
                    const hostInformation = document.createElement("div");
                    hostInformation.classList.add("host-information");
                    hostInformation.innerHTML = `<img src = "no-image.png"></img> There is no host information!`;
                    div.appendChild(hostInformation);
                }
            });
        } else {
            nearbyMeetupList.innerHTML = "검색결과가 없습니다!";
        }
    });
}

const resetBtn = document.querySelector("#resetFavorites");
resetBtn.addEventListener("click", function() {
    localStorage.clear();
    document.querySelector("#favoriteContainer").innerHTML = "";
    document.querySelectorAll(".added-favorite").forEach(function(el) {
        el.classList.add("meetup-information");
        el.classList.remove("added-favorite");
    });
    const notPaintedFavorite = document.querySelectorAll(".favorite-border");
    notPaintedFavorite.forEach(function(data) {
        data.src = "favorite-border.png";
    });
});

const modal = document.querySelector("#favoriteModal");
const openFavoriteModal = document.querySelector("#openFavoriteModal");
const closeModal = document.querySelector(".closeModal");

openFavoriteModal.addEventListener("click", function() {
    favoriteMeetupStorage.removeItem("loglevel:webpack-dev-server");
    modal.style.display = "block";
    addEventToDeleteFavoriteBtn()
});

closeModal.addEventListener("click", function() {
    modal.style.display = "none";
});

window.addEventListener("click", function(e) {
    if(e.target === modal) {
        modal.style.display = "none";
    }
});

const deleteFavorite = document.querySelectorAll(".deleteFavorite");
function addEventToDeleteFavoriteBtn() {
    deleteFavorite.forEach(function(el) {
        el.addEventListener("click", function(e) {
            e.target.parentNode.parentNode.removeChild(e.target.parentNode);
            favoriteMeetupStorage.removeItem(e.target.parentNode.childNodes[1].innerText);
        });
    });
}

const lock = document.querySelector(".lock");
const loginBtn = document.querySelector("#loginBtn");
const loginArea = document.querySelector(".loginArea");

loginBtn.addEventListener("click", function() {
    loginArea.style.display = "block";
});

window.addEventListener("click", function(e) {
    if(e.target === lock) {
        loginArea.style.display = "none";
    }
});
