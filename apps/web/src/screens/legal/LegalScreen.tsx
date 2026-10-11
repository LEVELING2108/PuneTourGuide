import { useNavigate } from 'react-router';
import { LAST_UPDATED, privacy, terms } from '../../content/legal';

/**
 * Terms of Use and Privacy Policy. There is no mockup for these pages, so they use theme
 * tokens only and read like a document. Public: linked from sign-up before you have an account.
 */
export default function LegalScreen({ doc }: { doc: 'terms' | 'privacy' }) {
  const navigate = useNavigate();
  const d = doc === 'terms' ? terms() : privacy();

  return (
    <div className="scr" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <main style={{ padding: '56px 24px 48px', maxWidth: 640, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          style={{ minHeight: 44, padding: '0 16px', borderRadius: 22, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 15 }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 36, lineHeight: 1.1, margin: '24px 0 4px' }}>{d.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 20px' }}>Last updated {LAST_UPDATED}</p>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 8px' }}>{d.intro}</p>
        {d.sections.map((s) => (
          <section key={s.heading}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, margin: '28px 0 8px' }}>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 40)} style={{ fontSize: 15, lineHeight: 1.6, margin: '0 0 10px', color: 'var(--ink)' }}>
                {p}
              </p>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
