const resultat=document.getElementById('resultat');
function erase(value){
    resultat.value = "";
}
function ajouter(value){
    resultat.value += value;
}
function calculer(value){
    let resultatFinal = resultat.value;
    let final=eval(resultatFinal);
    if(isNaN(final) || !isFinite(final)){
        resultat.value = "Error";
}
else{
    try{
        resultat.value = final;
    }
    catch(err){
        resultat.value = "Erreur";
    }
}}
function effacer(value){
    let resultatFinal = resultat.value;
    resultat.value = resultatFinal.substring(0, resultatFinal.length-1);
}
let nombre=parseInt(resultat.value)
function parenthese(value){
    if(resultat.value.length !=='9'){
      resultat.value+='('}
    else if(resultat.value.length==='9'){
         resultat.value+=')'
        }
    
}

const togglebutton= document.getElementById('togglebutton');
const menu=document.getElementById('menu');
togglebutton.addEventListener('click',function(){
    if(menu.style.display==='none' || menu.style.display===''){
        menu.style.display='grid';
    }
    else{
        menu.style.display='none';
        togglebutton.textContent='ψ'
    }
})

const menu_icon=document.getElementById('icon');
const nav=document.getElementById('nav');

    menu_icon.addEventListener('click',function(){
        if(nav.style.display==='none' || nav.style.display===''){
            nav.style.display='block';
        }
        else{
            nav.style.display='none';
            menu_icon.textContent='☰'
        }

    })
