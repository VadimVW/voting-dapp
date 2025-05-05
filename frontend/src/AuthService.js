// Сервіс для «авторизації» та створення локального гаманця

import { ethers } from "ethers";

const AUTH_URL    = "http://localhost:4000/auth/mock";
const STORAGE_KEY = "voting_wallet_pk";

/**
 * Логін через мок-ендпоінт та ініціалізація гаманця
 * - Емітуємо вхід
 * - Генеруємо пару ключів, якщо раніше не було
 */
export async function loginAndInitWallet() {
  // 1) Запит даних користувача
  const resp = await fetch(AUTH_URL);
  if (!resp.ok) throw new Error("Помилка авторизації");
  const user = await resp.json();
  console.log("Авторизовано як", user);

  // 2) Перевіряємо, чи є приватний ключ у localStorage
  let pk = localStorage.getItem(STORAGE_KEY);
  if (!pk) {
    // Якщо нема — створюємо новий гаманець
    const wallet = ethers.Wallet.createRandom();
    pk = wallet.privateKey;
    localStorage.setItem(STORAGE_KEY, pk);
    console.log("Створено новий гаманець:", wallet.address);
  } else {
    console.log("Завантажено гаманець з localStorage");
  }

  // 3) Повертаємо інстанс ethers.Wallet
  return new ethers.Wallet(pk);
}

/**
 * Повертає вже збережений гаманець, або null
 */
export function getStoredWallet() {
  const pk = localStorage.getItem(STORAGE_KEY);
  return pk ? new ethers.Wallet(pk) : null;
}