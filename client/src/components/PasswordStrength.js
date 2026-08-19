import React from 'react';

// Same minimum bar the backend enforces (authController.js isStrongPassword):
// 8+ chars, upper, lower, digit, special. Exposed so pages can pre-check
// before submitting instead of round-tripping to the server to find out.
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const LEVELS = [
  { label: 'Very weak', color: 'var(--red2)' },
  { label: 'Weak',      color: 'var(--red2)' },
  { label: 'Fair',      color: '#d29922' },
  { label: 'Good',      color: 'var(--green2)' },
  { label: 'Strong',    color: 'var(--green3)' },
];

// Lightweight heuristic scorer — no external dependency (e.g. zxcvbn) needed.
// Returns { score: 0-4, label, color, meetsMinimum }.
export function getPasswordStrength(password) {
  const pass = password || '';
  let score = 0;

  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  // Penalize low-effort patterns even if the checks above passed.
  if (pass && (/^(.)\1+$/.test(pass) || /^(?:0123456789|abcdefgh|password|qwerty)/i.test(pass))) {
    score = Math.min(score, 1);
  }

  score = Math.max(0, Math.min(4, pass ? score : 0));

  return {
    score,
    ...LEVELS[pass ? score : 0],
    meetsMinimum: STRONG_PASSWORD_REGEX.test(pass),
  };
}

// Visual meter + label + the specific requirements still unmet.
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const { score, label, color, meetsMinimum } = getPasswordStrength(password);

  const checks = [
    { ok: password.length >= 8, text: '8+ characters' },
    { ok: /[a-z]/.test(password), text: 'lowercase letter' },
    { ok: /[A-Z]/.test(password), text: 'uppercase letter' },
    { ok: /\d/.test(password), text: 'number' },
    { ok: /[@$!%*?&]/.test(password), text: 'special character (@$!%*?&)' },
  ];

  return (
    <div style={{ marginTop: '7px', marginBottom: '4px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= score ? color : 'var(--bg3)',
            transition: 'background .15s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color }}>{label}</span>
        {meetsMinimum && (
          <span style={{ fontSize: '11px', color: 'var(--green3)' }}>✓ Meets requirements</span>
        )}
      </div>
      {!meetsMinimum && (
        <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '3px', lineHeight: 1.6 }}>
          Needs:{' '}
          {checks.filter(c => !c.ok).map((c, i, arr) => (
            <span key={c.text}>{c.text}{i < arr.length - 1 ? ', ' : ''}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
