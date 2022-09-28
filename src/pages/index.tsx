import { GetStaticProps } from 'next';
import Link from 'next/link'
import Header from '../components/Header';

import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home({postsPagination}: HomeProps) {
  return (
    <>
      <main className={commonStyles.container}>
        <Header />

        <div>
          {postsPagination.results.map(post => {
            <div>
              <p>{post.first_publication_date}</p>
            </div>
          })}
        </div>

        {/* <div className={styles.posts}>
          <Link href={'/'}>
            <a className={styles.post}>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <ul>
                <li>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </li>
                <li>
                  <FiUser />
                  <time>15 Mar 2021</time>
                </li>
              </ul>
            </a>
          </Link>

          <Link href={'/'}>
            <a className={styles.post}>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <ul>
                <li>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </li>
                <li>
                  <FiUser />
                  <time>15 Mar 2021</time>
                </li>
              </ul>
            </a>
          </Link>
          <button type='button'> Carregar mais posts </button>
        </div> */}

        
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 100,
    orderings: {
      field: 'last_publication_date',
      direction: 'desc',
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  }

  return{
    props: {
      postsPagination
    }
  }
};
