export default function Home() {
  if (typeof window !== 'undefined') {
    window.location.href = 'https://jogoservidor.vercel.app/index.html';
  }
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://jogoservidor.vercel.app/index.html',
      permanent: false,
    },
  };
} 