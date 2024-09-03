function validateMissingLetter(letrasEliminadas, missingLetter) {
    return !letrasEliminadas.includes(missingLetter);
  }
  
  function removeFirstLetter(str) {
    if (str.length <= 1) return ['_', str];
  
    const letraEliminada = str.charAt(0);
    const resultado = '_' + str.substring(1);
    return [resultado, letraEliminada];
  }
  
  function removeTwoRandomLettersWithUnderscore(str) {
    if (str.length <= 2) return [str.substring(1), ''];
  
    let chars = str.split('');
    let indexesToRemove = [];
  
    while (indexesToRemove.length < 2) {
      let randomIndex = Math.floor(Math.random() * (chars.length - 1)) + 1;
      if (!indexesToRemove.includes(randomIndex)) {
        indexesToRemove.push(randomIndex);
      }
    }
  
    indexesToRemove.sort((a, b) => b - a);
  
    let letrasEliminadas = [];
    for (let index of indexesToRemove) {
      const letraEliminada = chars[index];
      letrasEliminadas.push(letraEliminada);
      chars.splice(index, 1, '_');
    }
  
    return [chars.join(''), letrasEliminadas];
  }
  
  module.exports = { validateMissingLetter, removeFirstLetter, removeTwoRandomLettersWithUnderscore };
  