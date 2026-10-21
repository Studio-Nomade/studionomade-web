import Image from "next/image";
import type { BlogBody } from "@studionomade/content-schema";

import styles from "./blog.module.css";

type Paragraph = Extract<BlogBody[number], { type: "paragraph" }>["text"];

function Inline({ text }: { text: Paragraph }) {
  return (
    <>
      {text.map((segment, index) =>
        segment.mark === "strong" ? (
          <strong key={index}>{segment.text}</strong>
        ) : segment.mark === "emphasis" ? (
          <em key={index}>{segment.text}</em>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </>
  );
}

/** Cuerpo de una nota: bloques estructurados, sin HTML embebido. */
export function BlogBodyContent({ body }: { body: BlogBody }) {
  return (
    <div className={styles.prose}>
      {body.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={index}>{block.text}</h2>
            ) : (
              <h3 key={index}>{block.text}</h3>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "quote":
            return (
              <blockquote key={index}>
                <p>
                  <Inline text={block.text} />
                </p>
              </blockquote>
            );
          case "image":
            return (
              <figure key={index} className={styles.figure}>
                <span className={styles.figureMedia}>
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    sizes="(min-width: 64em) 52rem, 100vw"
                    unoptimized={block.src.startsWith("https://")}
                  />
                </span>
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              </figure>
            );
          default:
            return (
              <p key={index}>
                <Inline text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
