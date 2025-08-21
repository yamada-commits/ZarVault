import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const metadata = {
  title: "ZarVault - Private Photo Gallery",
  description: "A beautiful and secure photo gallery for your memories",
  keywords: "photo gallery, private photos, image storage, memories",
  author: "ZarVault",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>ZarVault - Private Photo Gallery</title>
        <meta
          name="description"
          content="A beautiful and secure photo gallery for your memories"
        />
        <meta
          name="keywords"
          content="photo gallery, private photos, image storage, memories"
        />
        <meta name="author" content="ZarVault" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="ZarVault - Private Photo Gallery" />
        <meta
          property="og:description"
          content="A beautiful and secure photo gallery for your memories"
        />
        <meta property="og:type" content="website" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
