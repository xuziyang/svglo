import { activeSvgToJpgArticle, activeToolPageCopy } from '../i18n';

export function SvgToJpgArticle() {
  const article = activeSvgToJpgArticle();
  const copy = activeToolPageCopy().jpg;
  return (
    <article className="svg-jpg-article">
      <p className="svg-jpg-article-intro">{article.intro}</p>

      {article.sections.map((section) => (
        <section key={section.id} aria-labelledby={`svg-jpg-${section.id}`}>
          <h2 id={`svg-jpg-${section.id}`}>{section.title}</h2>
          <div className="svg-jpg-article-copy">
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      ))}

      <section className="svg-jpg-faq" aria-labelledby="svg-jpg-faq-title">
        <h2 id="svg-jpg-faq-title">{copy.faqTitle}</h2>
        {article.faq.map((item) => (
          <details key={item.q}>
            <summary><h3>{item.q}</h3></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </article>
  );
}
