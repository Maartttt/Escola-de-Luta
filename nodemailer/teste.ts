import dotenv from "dotenv";

// Carrega as variáveis do .env
dotenv.config();

// Agora você pode acessar via process.env
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Imprime no console
console.log("EMAIL_USER:", emailUser);
console.log("EMAIL_PASS:", emailPass);