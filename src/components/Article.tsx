import { articleContent } from '../i18n/article';
import { useLocale } from '../i18n/LocaleContext';

/** Long-form SEO article shown under the hero/dropzone on the landing view. */
export function Article() {
  const { locale } = useLocale();
  const a = articleContent[locale];

  return (
    <article className="article">
      <p className="article-intro">{a.intro}</p>

      <section className="article-steps" aria-labelledby="article-steps-title">
        <h2 id="article-steps-title">{a.stepsTitle}</h2>
        <ol>
          {a.steps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="article-features-title">{a.featuresTitle}</h2>
      <p className="article-lead">{a.featuresLead}</p>

      {a.sections.map((sec) => (
        <section key={sec.id} aria-labelledby={`article-${sec.id}`}>
          <h3 id={`article-${sec.id}`}>{sec.title}</h3>
          {sec.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}

      <section className="article-faq" aria-labelledby="article-faq-title">
        <h2 id="article-faq-title">{a.faqTitle}</h2>
        {a.faq.map((f) => (
          <details key={f.q}>
            <summary>
              <h3>{f.q}</h3>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    </article>
  );
}
