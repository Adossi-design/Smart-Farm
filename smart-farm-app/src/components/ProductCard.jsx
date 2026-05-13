import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContactButton from './ContactButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTranslatedText } from '../hooks/useTranslatedText';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked } = useData();
  const { t } = useTranslation();
  const translatedName = useTranslatedText(product?.name);

  const availableQuantity = product.quantityAvailable ?? product.quantity ?? 0;
  const ratingValue = Number(product.averageRating || product.seller?.averageRating || 0);
  const hasRating = ratingValue > 0;

  const openProduct = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article className="group flex h-full min-h-[20rem] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div
        role="button"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProduct();
          }
        }}
        className="relative block cursor-pointer text-left"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-800 dark:to-slate-900">
          {product.image ? (
            <img
              src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${product.image}` : product.image}
              alt={translatedName || product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
              <i className={`fas ${product.icon || 'fa-box'} fa-3x`}></i>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-emerald-300">
              <i className="fas fa-tag"></i>
              {t('product.availableNow')}
            </span>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (!user) {
                  navigate('/login');
                  return;
                }
                toggleBookmark(product);
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${isBookmarked(product.id) ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/40' : 'border-white/70 bg-white/95 text-slate-700 shadow-md hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            >
              <i className={`${isBookmarked(product.id) ? 'fas' : 'far'} fa-bookmark`}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 dark:text-white">{translatedName || product.name}</h3>
          <p className="text-xl font-black tracking-tight text-emerald-700">CFA {Number(product.price || 0).toLocaleString()}</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <span>{t('product.availableQuantityLabel')}: <span className="font-semibold text-slate-900 dark:text-white">{availableQuantity} {product.unit || ''}</span></span>
          {hasRating && (
            <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">★ {ratingValue.toFixed(1)}</span>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={openProduct}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <i className="fas fa-shopping-bag"></i>
            {t('product.buy')}
          </button>
          <ContactButton product={product} label={t('buyer.talkToSeller')} className="rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600" />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
