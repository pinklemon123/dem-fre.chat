import Layout from '@/components/Layout';
import type { GetStaticProps } from 'next';
import { factions, hotPosts, ranking, type Card } from '@/lib/data';

type Props = {
  hot: Card[];
  fac: Card[];
  rank: Card[];
};

export default function Home({ hot, fac, rank }: Props) {
  return (
    <Layout title="论坛首页">
      <section id="hot">
        <h2>🔥 热帖精选</h2>
        <div className="card-list">
          {hot.map((item, i) => (
            <div className="card" key={`hot-${i}`}>
              <div className="card-title">{item.title}</div>
              <div className="card-meta">{item.meta}</div>
              <div className="card-content">{item.content}</div>
            </div>
          ))}
        </div>
      </section>
      <section id="factions">
        <h2>热门派别</h2>
        <div className="card-list">
          {fac.map((item, i) => (
            <div className="card" key={`fac-${i}`}>
              <div className="card-title">{item.title}</div>
              <div className="card-meta">{item.meta}</div>
              <div className="card-content">{item.content}</div>
            </div>
          ))}
        </div>
      </section>
      <section id="ranking">
        <h2>用户排行榜</h2>
        <div className="card-list">
          {rank.map((item, i) => (
            <div className="card" key={`rank-${i}`}>
              <div className="card-title">{item.title}</div>
              <div className="card-meta">{item.meta}</div>
              <div className="card-content">{item.content}</div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      hot: hotPosts,
      fac: factions,
      rank: ranking,
    },
  };
};

