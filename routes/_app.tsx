import { AppProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function App({ Component }: AppProps) {
  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <link rel="icon" href="/favicon.ico" sizes="32x32" />

        <meta charSet="UTF-8" />

        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="JPT-Whats" />
        <meta property="og:title" content="JPT-Whats" />
        <meta property="og:description" content="JPT-Whats" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta
          name="keywords"
          content="gpt,whatsapp, openai, Deno, DenoLand, Development, JavaScript, TypeScript, chat, ai"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:400,700,300"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.1.2/css/material-design-iconic-font.min.css"
        />
        <link
          rel="stylesheet"
          href="https://rawgit.com/marvelapp/devices.css/master/assets/devices.min.css"
        />
        <link rel="stylesheet" href="/css/style.css" />
      </Head>
      <Component/>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js"></script>
      <script src="/js/script.js"></script>
    </div>
  );
}
