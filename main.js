var redirect_uri = "http://127.0.0.1:5500/index.html";

var client_id ="747cbaa41f2244d8990e5f690ed366cd";
var client_secret ="d0edad1ab59e4dadbbd697f99d1a45f0";
var Playlist_checker = 0;


const AUTHORIZE = "https://accounts.spotify.com/authorize?";


function login_cred(){  
    let login_url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-position%20user-library-read%20streaming%20user-read-playback-state%20user-read-recently-played%20playlist-modify-private&redirect_uri=${redirect_uri}`;    
    
    window.location.href= login_url;    
}

function getParameter(){    
    let parameters = window.location.hash;
    if (parameters.length>0){
    document.getElementById("login_Btn").style = "display:none;"
    document.getElementById("Signup_Btn").style = "display:none;"


    let token = parameters.substr(1).split('access_token=')[1].split('&token_type=Bearer&expires_in=3600')[0];
    localStorage.setItem('bearer',token);
    fetch("https://api.spotify.com/v1/me", {
        headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
        }       
        }).then((response) => {
            return response.json()
        }).then((result) => {
            console.log('current user info',result)

        }).catch((err) => {
            console.log(err)
        })    
        getRecentPlaylist();
    }
      
}

function getRecentPlaylist(){    
    let list_category = [];


    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=4", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem('bearer')}`,
          "Content-Type": "application/json"
        }
    }).then((response) => {
        return response.json();
    }).then((result) => {
        list_category=result.items;
        (function(){
            let recent_playlist = elementCreation('h4','text-left');
            recent_playlist.innerHTML ="Recently Played Songs";
            var main_page = document.getElementById("main");
            main_page.innerHTML="";
            main_page.append(recent_playlist);
            createMusicCards(list_category);
        })();
       
        console.log(result.items);
    }).catch((err) => {
        console.error(err);
    })}


function createMusicCards(array){
    var main_page = document.getElementById("main");
    let PlayList_div = elementCreation('div','d-flex align-items-start',"recentPlay");   
    
   array.forEach(element => {
    var card = elementCreation('div','card bg-light text-black mr-2 ml-2','cards');
    var row = elementCreation('div','row');
    var col_4 = elementCreation('div','col-4');

    var imgs = elementCreation('img','img-fluid img-thumbnail','recent_playlist_images');
    imgs.setAttribute('src',element.track.album.images[0].url)

    col_4.append(imgs);  

    var col_8 = elementCreation('div','col-8');
    var h5 = elementCreation('h5','text-justify titlecard');
    h5.innerHTML = element.track.name;

    col_8.append(h5);
    row.append(col_8,col_4);
    card.append(row);
    PlayList_div.append(card) 
    main_page.append(PlayList_div);       
    });
}


function elementCreation(eleName, eleClass= "", eleId=""){
    var element = document.createElement(eleName);
            element.setAttribute("class",eleClass);
            element.setAttribute("id",eleId);
            return element                    
        }




function getUserPlaylist(){
    let list_playlist = [];
    if(Playlist_checker == 0){    
        fetch("https://api.spotify.com/v1/me", {
            headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem('bearer')}`,
            "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json();
        }).then((result) => {
            let user_id =result.id;
            localStorage.setItem('user_id',user_id);
            fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
            headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem('bearer')}`,
            "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json();
        }).then((result) => {
            list_playlist=result.items.slice(1);
            console.log(list_playlist);
            (function(){
            let user_playlist_info = document.getElementById("sidebar_playlist");
            let Playlist_list = elementCreation('ul','navbar-nav mr-auto');

            list_playlist.forEach(ele=>{
                let Playlist_list_items = elementCreation('li','nav-item');
                let item_tag = elementCreation('span','ms-4');
                item_tag.innerHTML = ele.name;
                let playlist_id = ele.id;
                item_tag.addEventListener('click',()=>Display_PlayList(playlist_id));
                Playlist_list_items.append(item_tag);
                Playlist_list.append(Playlist_list_items);
                user_playlist_info.append(Playlist_list);
            })}())

            function Display_PlayList(id){
                    var playListId = id;
                    fetch(`https://api.spotify.com/v1/playlists/${playListId}`, {
                    headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem('bearer')}`,
                    "Content-Type": "application/json"
                    }
                    }).then((response) => {
                        return response.json();
                    }).then((res) => {
                        console.log("user_playlist, ", res);
                        let Playlist_Tracks = res.tracks.items;
                        console.log(Playlist_Tracks);                       

                        // function to display Playlist and tracks
                        let displaPlaylistTracks = function(){
                        let main_page = document.getElementById("main");
                        main_page.innerHTML = "";
                        let PlayList_Image_Div = elementCreation('div','','PlayList_Image_Div');

                        let PlayList_Image = elementCreation('img','rounded float-left','PlayList_Image');
                        PlayList_Image.setAttribute('src',res.images[0].url);

                        let Playlist_head = elementCreation('div','d-flex justify-content-end flex-column align-items-start','PlayListHeading')

                        let h5 = elementCreation('h5');
                        h5.innerHTML = "PLAYLIST"

                        let h1 = elementCreation('h1','Playlist_name','Playlist_name');
                        h1.innerHTML = res.name;


                        let h6 = elementCreation('h6','Playlist_Info','Playlist_Info');

                        if(Playlist_Tracks.length === 0){
                            h6.innerHTML = res.owner.display_name;
                        }
                        else{
                            let duration_time= 0;
                            let songs_count = 0;
                            let TracksDurationTime= function(){
                                Playlist_Tracks.forEach(ele => {
                                    duration_time += ele.track.duration_ms;
                                    songs_count += 1;                                   
                                })
                                let mins = Math.floor(duration_time/60000);
                                let secs = Math.floor((duration_time%60000)/1000);
                                return ` .${songs_count} Songs, ${mins} Mins ${secs} Secs`
                            }
                            h6.innerHTML = `${res.owner.display_name} ${TracksDurationTime()} `
                        }
                        
                            Playlist_head.append(h5,h1,h6);

                            PlayList_Image_Div.append(PlayList_Image,Playlist_head);
                            main_page.append(PlayList_Image_Div);

                            let PlayList_Track_Table = elementCreation('div','d-flex','PlayList_Track_Table');
                            
                            var tables = document.createElement('table');
                            tables.classList.add('table','table-hover');

                            var thead = document.createElement('thead');
                            thead.setAttribute('class','thead-light');

                            var theadr = document.createElement('tr');

                            var theadtd1 =  document.createElement('th');
                            theadtd1.innerHTML = "#";

                            var theadtd2 =  document.createElement('th');
                            theadtd2.innerHTML = "TITLE";

                            var theadtd3 =  document.createElement('th');
                            theadtd3.innerHTML = "ALBUM";

                            var theadtd4 =  document.createElement('th');
                            theadtd4.innerHTML = "DATE ADDED";

                            var theadtd5 =  elementCreation('th');
                            var clock_icon = elementCreation('i','fa fa-clock-o')
                            theadtd5.append(clock_icon);
                            
                            var tbody = document.createElement('tbody');

                           (function(){
                                let index_number = 0;
                                
                                Playlist_Tracks.forEach(obj=>{
                                    index_number += 1;
                                    let trackDurationTime = function(){
                                        let duration_time_track = obj.track.duration_ms;
                                        let mins = Math.floor(duration_time_track/60000);
                                        let secs = Math.floor((duration_time_track%60000)/1000);
    
                                        return `${mins}:${secs} `;
    
                                    } 
                                
                                let track_uri = obj.track.uri;
                                var tr =  elementCreation('tr','track_row'); 
                                var td1 = document.createElement('td');
                                td1.textContent = index_number;

                                var td2 = document.createElement('td');
                                td2.textContent = obj.track.name;
                                                    
                                var td3 = document.createElement('td');
                                td3.textContent = obj.track.album.name;
                                                
                                var td4 = document.createElement('td');
                                td4.textContent = (function(){
                                    let date =  new Date(obj.added_at);
                                    let today = new Date();
                                    var diff_in_time = today.getTime()-date.getTime();
                                    var days =  Math.round(diff_in_time/(1000*60*60*24))
                                    return `${days} days ago`
                                    
                                }())

                                var timeDelete = elementCreation('td','timeDelete');
                                timeDelete.innerHTML= `${trackDurationTime()}`;
                                let trackDeleteButton = elementCreation('button','Delete_button','Delete_button');
                                    trackDeleteButton.setAttribute('type','button')
                                    trackDeleteButton.addEventListener("click", ()=>{
                                       console.log("DEL");
                                       console.log(track_uri);
                                       console.log(playListId)
                                       fetch(`"https://api.spotify.com/v1/playlists/${playListId}/tracks"`, {
                                            body: "{\"tracks\":[{\"uri\":\"" + track_uri + "\"}]}",
                                            headers: {
                                                Accept: "application/json",
                                                Authorization: `Bearer ${localStorage.getItem('bearer')}`,
                                                "Content-Type": "application/json",
                                                allow:"DELETE" 
                                            },
                                            method: "DELETE"
                                        }).then(results =>{
                                            console.log(results);
                                            // Display_PlayList(playListId);
                                        }).catch((err) => {
                                            console.error(err);
                                        })                               
                                });

                                    
                                    let Delete_icon = elementCreation('i','fa fa-trash');
                                    trackDeleteButton.append(Delete_icon);      
                                                                   

                                    timeDelete .append(trackDeleteButton);


                                
                                
                                tr.append(td1,td2,td3,td4,timeDelete);
                                            
                                tbody.append(tr);
                                
                            theadr.append(theadtd1,theadtd2,theadtd3,theadtd4,theadtd5);
                            thead.append(theadr);

                            tables.append(thead,tbody);

                            })}());

                            PlayList_Track_Table.append(tables);

                            main_page.append(PlayList_Track_Table);

                        };

                        displaPlaylistTracks();

                        //function to display recomendations tracks
                        (function(){

                            fetch("https://api.spotify.com/v1/recommendations?limit=10&market=IN&seed_artists=1pDF5UltcypyatITA3Pduo%2C6LWyVEIBnx7MoRBhQxu9om%2C2FgHPfRprDaylrSRVf1UlN&seed_genres=new-release&seed_tracks=0c6xIDDpzE81m2q797ordA", {
                                headers: {
                                    Accept: "application/json",
                                    Authorization: `Bearer ${localStorage.getItem('bearer')}`,
                                    "Content-Type": "application/json"
                                }
                            }).then(response =>{
                                return response.json();
                            }).then(results =>{
                                console.log(results.tracks);

                                let recomended_tracks = results.tracks;

                            
                                let main_page = document.getElementById("main");

                                let RecomendationHeading = elementCreation('h3','','Recomendation_Heading');
                                RecomendationHeading.innerHTML = "Recommended Songs";
                                let track_card = elementCreation('div','card','track_card');

                                
                                
                                recomended_tracks.forEach(trac=>{
                                    let track_uri = trac.uri;                                    
                                    
                                    let track_card_row = elementCreation('div','row','track_row');

                                    let track_card_col1 = elementCreation('div','col-1','image_col');                                  
                                    let track_img = elementCreation('img','','track_img');
                                    track_img.setAttribute('src',`${trac.album.images[2].url}`);
                                    track_card_col1.append(track_img);

                                    let track_card_col2 = elementCreation('div','col-6','track_name');
                                    let track_name = elementCreation('h6');
                                    track_name.innerHTML = trac.name;
                                    track_card_col2.append(track_name);

                                    let track_card_col3 = elementCreation('div','col-4','track_movie_name');
                                    let track_movie_name =elementCreation('h6');
                                    track_movie_name.innerHTML = trac.album.name;
                                    track_card_col3.append(track_movie_name);   

                                    let track_card_col4 = elementCreation('div','col-1','track_add_button');                                    
                                    let track_add_button = elementCreation('input','btn','Add_button');
                                    track_add_button.setAttribute('type','button');
                                    track_add_button.setAttribute('value','ADD');
                                    track_add_button.addEventListener('click',function(){
                                        fetch(`https://api.spotify.com/v1/playlists/${playListId}/tracks?uris=${track_uri}`, {
                                        headers: {
                                            Accept: "application/json",
                                            Authorization: `Bearer ${localStorage.getItem('bearer')}`,
                                            "Content-Type": "application/json"
                                        },
                                        method: "POST"
                                        }).then(response =>{
                                            return response.json();
                                        }).then(results =>{
                                            console.log(results);
                                            Display_PlayList(playListId);
                                        }).catch((err) => {
                                            console.error(err);
                                        })
                                    })
                                    track_card_col4.append(track_add_button);

                                    track_card_row.append(track_card_col1,track_card_col2,track_card_col3,track_card_col4);
                                    track_card.append(track_card_row);                                                                
                                })

                                main_page.append(RecomendationHeading,track_card) 
                               

                            }).catch((err) => {
                                console.error(err);
                            })
                            




                        }());



                    }).catch((err) => {
                        console.error(err);
                    })

            }

        }).catch((err) => {
            console.error(err);
        })      
        }).catch((err) => {
            console.error(err);
        })
        Playlist_checker = 1;
    }
}

