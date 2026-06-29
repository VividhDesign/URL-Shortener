//base62 - 62 chars -> 62 to power 6 = 56 billion possible comibations
//lessor collisions, handle collisions in controllers
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CODE_LENGTH = 6;

//generate random 6 chars base62 string

const generateShortCode = () => {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * ALPHABET.length);
        code += ALPHABET[randomIndex];
    }
    return code;
};

module.exports = { generateShortCode };