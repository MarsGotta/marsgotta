import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <h1>Marcela Gotta</h1>
      <p>Senior Product Engineer · Building agent harnesses</p>
      <p>
        <em>Site under construction — full design coming in F2.</em>
      </p>
    </main>
  );
}
