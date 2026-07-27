import { svgToJpgArticle } from '../i18n/svgToJpgArticle';

export function SvgToJpgArticle() {
  return (
    <article className="svg-jpg-article">
      <p className="svg-jpg-article-intro">{svgToJpgArticle.intro}</p>

      {svgToJpgArticle.sections.map((section) => (
        <section key={section.id} aria-labelledby={`svg-jpg-${section.id}`}>
          <h2 id={`svg-jpg-${section.id}`}>{section.title}</h2>
          <div className="svg-jpg-article-copy">
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      ))}

      <section className="svg-jpg-faq" aria-labelledby="svg-jpg-faq-title">
        <h2 id="svg-jpg-faq-title">SVG to JPG converter FAQ</h2>
        {svgToJpgArticle.faq.map((item) => (
          <details key={item.q}>
            <summary><h3>{item.q}</h3></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </article>
  );
}
