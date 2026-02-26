export function validatePassword(password: string): string | null {
  // Min 8, >=1 uppercase, >=1 number, >=1 symbol
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!regex.test(password)) {
    return "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 symbol.";
  }
  return null;
}