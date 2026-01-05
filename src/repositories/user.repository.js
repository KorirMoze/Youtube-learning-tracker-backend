// src/repositories/user.repository.js
export async function findByEmail(pool, email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

export async function findByProvider(pool, provider, providerId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
    [provider, providerId]
  );
  return result.rows[0] || null;
}
export async function create(pool, user) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, avatar_url, provider, provider_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, name, provider, avatar_url, created_at`,
    [user.email, user.passwordHash, user.name, user.avatarUrl, user.provider, user.providerId]
  );

  return result.rows[0];
}
