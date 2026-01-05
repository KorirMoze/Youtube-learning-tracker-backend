export class User {
  constructor({ id, email, name, passwordHash }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.passwordHash = passwordHash;
  }
}