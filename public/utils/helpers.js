// utils/helpers.js

function shuffleArray(array) {
    // Compatibilidade com navegadores mais antigos
    const newArray = Array.prototype.slice.call(array);
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    return newArray;
}

function getRandomCharacters(sourceArray, count) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
        console.warn('Array de origem inválido ou vazio');
        return [];
    }
    const numToPick = Math.min(count, sourceArray.length);
    return shuffleArray(sourceArray).slice(0, numToPick);
}

// Disponibilizar globalmente para compatibilidade
window.shuffleArray = shuffleArray;
window.getRandomCharacters = getRandomCharacters;