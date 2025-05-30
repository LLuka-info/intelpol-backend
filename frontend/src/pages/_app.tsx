import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "./styles/globals.css";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <link rel="icon" type="image/png" href="../../public/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}