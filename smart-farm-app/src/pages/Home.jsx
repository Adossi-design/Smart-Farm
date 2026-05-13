import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { t } = useTranslation();
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', label: t('buyer.allCategories') },
    { id: 'vegetables', label: t('buyer.freshVegetables') },
    { id: 'fruits', label: t('buyer.freshFruit') },
    { id: 'meat', label: t('buyer.freshMeat') },
    { id: 'fish', label: t('buyer.freshFish') },
    { id: 'local', label: t('buyer.localFood') }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch = !search || [product.name, product.description, product.location]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));

      const productCategory = (product.category || '').toLowerCase();
      const matchesCategory =
        category === 'all' ||
        productCategory === category ||
        (category === 'local' && ['grains', 'cereals', 'local food'].includes(productCategory));

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, category]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white shadow-xl p-6 md:p-10 text-center">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.45),_transparent_35%)]"></div>
            <div className="absolute -right-10 top-6 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
            <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-lime-300/20 blur-3xl animate-pulse"></div>
          </div>

          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-sm font-semibold mb-4 mx-auto">
              <i className="fas fa-sparkles"></i>
              {t('nav.marketplace')}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold">{t('hero.title')}</h1>
            <p className="text-emerald-50 mt-4 max-w-2xl mx-auto">{t('hero.subtitle')}</p>

            <div className="mt-8 max-w-2xl mx-auto relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                className="w-full bg-white text-slate-900 border border-white/40 rounded-2xl px-5 py-4 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/70"
              />
              <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700"></i>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('home.browseCategory')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={`group relative overflow-hidden rounded-2xl px-6 py-5 font-bold text-center transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 ${
                  category === item.id
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-300 dark:shadow-emerald-900 scale-105'
                    : 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-slate-600 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-md dark:shadow-none'
                }`}
              >
                <span className="relative z-10 flex flex-col items-center gap-1">
                  <i className="fas fa-tag text-lg"></i>
                  <span className="text-sm">{item.label}</span>
                </span>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${category === item.id ? 'bg-white' : 'bg-emerald-900'}`}></div>
              </button>
            ))}
          </div>
        </section>

        <section>
          {filteredProducts.length > 0 ? (
            <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 [&>*]:h-full">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
              <i className="fas fa-search text-5xl text-slate-300 dark:text-slate-700 mb-4"></i>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-100">{t('common.noResults')}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{t('home.tryCategory')}</p>
            </div>
          )}
        </section>

        <section id="about" className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.aboutTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-4 leading-7">
              {t('home.aboutDesc1')}
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4 leading-7">
              {t('home.aboutDesc2')}
            </p>
          </div>

          <div id="contact" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.contactUs')}</h2>
            <div className="mt-5 space-y-4 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3"><i className="fas fa-user text-emerald-600 w-5"></i><span>{t('home.contactName')}</span></div>
              <div className="flex items-center gap-3"><i className="fas fa-envelope text-emerald-600 w-5"></i><span>{t('home.contactEmail')}</span></div>
              <div className="flex items-center gap-3"><i className="fas fa-phone text-emerald-600 w-5"></i><span>{t('home.contactPhone')}</span></div>
              <div className="flex items-center gap-3"><i className="fas fa-map-marker-alt text-emerald-600 w-5"></i><span>{t('home.contactAddress')}</span></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
