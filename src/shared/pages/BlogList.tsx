import type { FC } from 'react';

type PostMeta = {
  slug: string;
  title?: string;
  date?: string;
  excerpt?: string;
};

type Props = {
  posts: PostMeta[];
};

export const BlogList: FC<Props> = ({ posts }) => {
  return (
    <div className="blog-container">
      <section className="blog-section">
        <h1 className="blog-title">Blog</h1>
        <ul className="blog-list">
          {posts.map((meta) => {
            const title = meta.title ?? meta.slug.replace(/-/g, ' ');
            const dateLabel = meta.date ? meta.date.slice(0, 10) : null;
            return (
              <li key={meta.slug} className="blog-item">
                <a href={`/${meta.slug}`} className="blog-link">
                  <h2 className="blog-item-title">{title}</h2>
                  {dateLabel && <small className="blog-item-date">{dateLabel}</small>}
                  {meta.excerpt && <p className="blog-item-excerpt">{meta.excerpt}</p>}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
