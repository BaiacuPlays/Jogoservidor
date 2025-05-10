// utils/helpers.js

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function getRandomCharacters(sourceArray, count) {
    if (sourceArray.length === 0) return [];
    const numToPick = Math.min(count, sourceArray.length);
    const shuffled = [...sourceArray];
    shuffleArray(shuffled);
    return shuffled.slice(0, numToPick);
}