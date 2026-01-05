// src/repositories/user.repository.js
export async function findByEmail(pool, email) {
  const result = await pool.query(
    'SELECT id, email, name, password_hash FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

export async function create(pool, { email, passwordHash, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, password_hash`,
    [email, passwordHash, name]
  );

  return result.rows[0];
}
