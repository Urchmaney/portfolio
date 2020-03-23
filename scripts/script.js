const header = document.getElementById('header');

const changeOffset = document.getElementById('projects').offsetTop - 25;

const changeLargeScreenHeaderColor = () => {
    if(window.pageYOffset > changeOffset){
        header.classList.add('headeOffColor');
    }
    else{
        header.classList.remove('headeOffColor');
    }
}

window.onscroll = () => { changeLargeScreenHeaderColor ()};