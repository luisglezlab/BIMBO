const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password) => {

    var str = password;
    var key = 'market';

    var lowerCaseStr = str.toLowerCase();
    var keyLowerCaseStr = key.toLowerCase();
    var alphabet = 'abcdefghijklmnñopqrstuvwxyz'.split('');
    var newStr = '';
    var j = 0;

    for(var i = 0; i < lowerCaseStr.length; i++){
        var currentLetter = lowerCaseStr[i];
        var keycurrentLetter = keyLowerCaseStr[j];
        if(currentLetter == ' '){
            newStr += currentLetter; // No convertimos los espacios
            continue;
        }
        if(j < (keyLowerCaseStr.length - 1)){
            j++;
        }else{
            j = 0;
        }
        
        var currentIndex = alphabet.indexOf(currentLetter); // Buscamos la letra actual del texto plano en el alfabeto y devolvemos un número (0-26)
        var keyCurrentIndex = alphabet.indexOf(keycurrentLetter);// Buscamos la letra actual de la llave en el alfabeto y devolvemos un número (0-26)
        var newIndex = (currentIndex + keyCurrentIndex) % 27; // Aplicamos la fórmula
        newStr += alphabet[newIndex]; // Añadimos al texto cifrado
    }
   return newStr;

    /*const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;*/
};

helpers.matchPassword = async (password, savedPasword) => {
    try{
    var str = savedPasword;
    var key = 'market';

    var lowerCaseStr = str.toLowerCase();
    var keyLowerCaseStr = key.toLowerCase();
    var alphabet = 'abcdefghijklmnñopqrstuvwxyz'.split('');
    var newStr = '';
    var j = 0;

    for(var i = 0; i < lowerCaseStr.length; i++){
        var currentLetter = lowerCaseStr[i];
        var keycurrentLetter = keyLowerCaseStr[j];
        if(currentLetter == ' '){
            newStr += currentLetter; // No convertimos los espacios
            continue;
        }
        if(j < (keyLowerCaseStr.length - 1)){
            j++;
        }else{
            j = 0;
        }
        
        var currentIndex = alphabet.indexOf(currentLetter); // Buscamos la letra actual del texto plano en el alfabeto y devolvemos un número (0-26)
        var keyCurrentIndex = alphabet.indexOf(keycurrentLetter);// Buscamos la letra actual de la llave en el alfabeto y devolvemos un número (0-26)
        if (currentIndex - keyCurrentIndex >= 0){
            var newIndex = (currentIndex - keyCurrentIndex) % 27; // Aplicamos la fórmula
            newStr += alphabet[newIndex]; // Añadimos al texto cifrado
        }else{
            var newIndex = (currentIndex - keyCurrentIndex + 27) % 27; // Aplicamos la fórmula
            newStr += alphabet[newIndex]; // Añadimos al texto cifrado
        }
    }
    if(password == newStr){
        return true;
    }
    }catch(e){
        console.log(e);
    }
    /*try{
        return await bcrypt.compare(password, savedPasword);
    }catch(e){
        console.log(e);
    }*/
};

module.exports = helpers;