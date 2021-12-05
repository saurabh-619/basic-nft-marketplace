import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <nav className="flex flex-row items-center justify-between p-6 border-b">
        <p className="text-4xl font-bold">Metaverse Marketplace</p>
        <div className="mt-4">
          <Link href="/" passHref>
            <a className="mr-6 text-pink-500">Home</a>
          </Link>
          <Link href="/create-item" passHref>
            <a className="mr-6 text-pink-500">Sell Digital Asset</a>
          </Link>
          <Link href="/my-items" passHref>
            <a className="mr-6 text-pink-500">My Digital Asset</a>
          </Link>
          <Link href="/creator-dashboard" passHref>
            <a className="mr-6 text-pink-500">Creator Dashboard</a>
          </Link>
        </div>
      </nav>
      <div className="py-5 pb-3 px-9">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
