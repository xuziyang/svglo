import { Header } from './Header';
import { SiteFooter } from './SiteFooter';
import { legalPages, locale, type LegalPageId } from '../i18n';

interface LegalPageProps {
  page: LegalPageId;
}

/** Static trust pages: about, contact, privacy policy, and terms. */
export function LegalPage({ page }: LegalPageProps) {
  const copy = legalPages[locale][page];

  return (
    <div className="app">
      <Header hasImage={false} onReset={() => undefined} />
      <main className="main legal-main">
        <article className="legal-page">
          <header className="legal-header">
            <span className="legal-kicker">{copy.kicker}</span>
            <h1>{copy.title}</h1>
            <p className="legal-lead">{copy.lead}</p>
            <p className="legal-updated">{copy.updated}</p>
          </header>

          {copy.sections.map((section) => (
            <section key={section.id} className="legal-section" aria-labelledby={`legal-${section.id}`}>
              <h2 id={`legal-${section.id}`}>{section.title}</h2>
              {section.blocks.map((block, index) =>
                Array.isArray(block) ? (
                  <ul className="legal-list" key={index}>
                    {block.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p key={index}>{block}</p>
                ),
              )}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
