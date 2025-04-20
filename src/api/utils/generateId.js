// src/api/utils/generateId.js
const generateId = () => Math.random().toString(36).substring(2, 9);
module.exports = { generateId };