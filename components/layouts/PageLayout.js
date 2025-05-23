import Header from "./Header";
import Footer from "./Footer";
import Link from 'next/link';

export default function PageLayout({ children, title, breadcrumbs }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span>/</span>
                    <span className={index === breadcrumbs.length - 1 ? "text-white" : ""}>
                      {crumb.label}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          {/* Page Title */}
          {title && (
            <h1 className="text-4xl font-bold mb-8">{title}</h1>
          )}
          
          {/* Page Content */}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 