import { GetStaticProps } from 'next';
import Link from 'next/link'
import Header from '../components/Header';

import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { Head } from 'next/document';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const formatedPosts = postsPagination.results.map(post => ({
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBr
      }
    )
  }))
  const [posts, setPosts] = useState<Post[]>(formatedPosts)
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage(): Promise<void> {
    if (nextPage == null) return;

    const postsResult = await fetch(nextPage)
      .then(response => response.json()
      );

    setNextPage(postsResult.next_page);

    const newPost = postsResult.results.map((post: Post) => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBr
          }
        ),
      };
    });

    setPosts([...posts, ...newPost])
  }

  return (
    <>
    <Head>
      Home | spacetraveling
    </Head>
    <main className={commonStyles.container}>
      <Header />

      <div className={styles.posts}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`}>
            <a className={styles.post}>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <ul>
                <li>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                </li>
                <li>
                  <FiUser />
                  <time>{post.data.author}</time>
                </li>
              </ul>
            </a>
          </Link>
        ))}

      {nextPage && (
        <button type="button" onClick={handleNextPage}>
          Carregar mais posts
        </button>
      )
      }
      </div>
      
    </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 2,
    orderings: {
      field: 'last_publication_date',
      direction: 'desc',
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  }

  return {
    props: {
      postsPagination
    }
  }
};
