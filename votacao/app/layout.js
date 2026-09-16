import './globals.css';

export const metadata = {
  title: 'Poder do Povo - Sistema Oficial de Votação',
  description: 'Plataforma interativa para consulta e votação em candidatos e líderes comunitários.',
  icons: {
    icon: '/icone.png',
    shortcut: '/icone.png',
    apple: '/icone.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-decorations">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="glow-orb orb-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
