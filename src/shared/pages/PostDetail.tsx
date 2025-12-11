import type { FC } from 'react';

type Props = {
  slug: string;
  html: string;
  meta: {
    title?: string;
    date?: string;
    excerpt?: string;
  };
};

export const PostDetail: FC<Props> = ({ slug, html, meta }) => {
  const title = meta.title ?? slug.replace(/-/g, ' ');
  const dateLabel = meta.date ? meta.date.slice(0, 10) : null;

  return (
    <div className="post-container">
      <article className="post-article">
        <header className="post-header">
          <h1 className="post-title">{title}</h1>
          {dateLabel && (
            <time className="post-date" dateTime={dateLabel}>
              {dateLabel}
            </time>
          )}
        </header>
        <div 
          className="post-content" 
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      </article>
    </div>
  );
};
