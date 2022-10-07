import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const formatedDate = format(new Date(post.first_publication_date),
    'dd MMM yyyy',
    {locale: pt}
  )

  return(
    <>
    <Header />

    <img src={post.data.banner.url} alt="Banner" className={styles.banner} />

    <main className={commonStyles.container}>
      <div className={styles.post}>
        <div className={styles.postTop}>
          <h1>{post.data.title}</h1>
          <ul>
            <li>
              <FiCalendar/>
              {formatedDate}
            </li>
            <li>
            <FiUser/>
              {post.data.author}
            </li>
            <li>
              <FiClock/>
              1 min
            </li>
          </ul>
        </div>

      {post.data.content.map(content => {
        return(
          <article key={content.heading}>
            <h2>{content.heading}</h2>
            <div 
            className={styles.postContent}
            dangerouslySetInnerHTML={{
              __html: RichText.asHtml(content.body),
            }}>
            </div>
          </article>
        )
      })}

      </div>
    </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    };
  });

  return {
    paths,
    fallback: true,
  }
  
};

export const getStaticProps: GetStaticProps = async ({params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID("posts", String(slug));

  return {
    props: {
      post: response,
    },
    revalidate: 1800,
  }
};
