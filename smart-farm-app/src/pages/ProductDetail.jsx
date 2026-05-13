import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { buildApiUrl } from '../utils/api';
import { useTranslatedFields } from '../hooks/useTranslatedText';
import RatingModal from '../components/RatingModal';
import ReportModal from '../components/ReportModal';

const ProductDetail = () => {
  const { t } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useData();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const translatedFields = useTranslatedFields({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    profession: seller?.profession || ''
  });

  const fetchSellerReviews = useCallback(async (sellerId) => {
    try {
      const response = await fetch(buildApiUrl(`/api/reviews/seller/${sellerId}`));
      if (response.ok) {
        const data = await response.json();
        setSeller(data.seller);
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
    }
  }, []);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/products/${productId}`));
      if (!response.ok) {
        alert(t('errors.notFound'));
        navigate('/');
        return;
      }
      const data = await response.json();
      setProduct(data);

      // Fetch seller info and reviews
      if (data.sellerId) {
        fetchSellerReviews(data.sellerId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert(t('errors.loadingFailed'));
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [fetchSellerReviews, navigate, productId, t]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleAddToCart = () => {
    if (!user) {
      alert(t('errors.unauthorized'));
      navigate('/login');
      return;
    }

    if (quantity > (product.quantityAvailable || product.quantity)) {
      alert(t('product.notEnoughQuantity') || 'Not enough quantity available');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity,
      unit: product.unit || 'piece',
      sellerId: product.sellerId
    });

    alert(`${quantity} ${product.unit || 'item'}(s) ${t('common.add')}`);
    setQuantity(1);
  };

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(buildApiUrl('/api/conversations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          productId: product.id,
          participantIds: [product.sellerId]
        })
      });
      const conv = await res.json();
      const role = user.role;
      if (role === 'buyer') navigate(`/buyer?tab=messages&conversationId=${conv.id}`);
      else if (role === 'farmer' || role === 'seller') navigate(`/seller?tab=messages&conversationId=${conv.id}`);
      else navigate(`/chat?conversationId=${conv.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewAdded = () => {
    setShowRatingModal(false);
    fetchSellerReviews(product.sellerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-primary-green"></i>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const averageRating = seller?.averageRating || 0;
  const totalReviews = seller?.totalReviews || 0;

  const productImage = product?.image
    ? (product.image.startsWith('/uploads') ? buildApiUrl(product.image) : product.image)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Product Details Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg">
              {productImage ? (
                <img 
                  src={productImage} 
                  alt={translatedFields.name || product.name}
                  className="max-h-96 object-cover rounded"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <i className="fas fa-image text-6xl mb-4"></i>
                  <p>{t('product.noImage') || 'No image available'}</p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-dark-green mb-2">{translatedFields.name || product.name}</h1>
              <p className="text-gray-600 text-sm mb-6">{translatedFields.category || product.category}</p>

              {/* Seller Info */}
              <div className="bg-emerald-50 rounded-lg p-4 mb-6 border-2 border-emerald-200">
                <h3 className="font-bold text-dark-green mb-2">{t('product.sellerInfo') || 'Seller Information'}</h3>
                <p className="text-gray-700 font-medium">{seller?.name}</p>
                {seller?.profession && (
                  <p className="text-gray-600 text-sm capitalize">{t('buyer.profession')}: {translatedFields.profession || seller.profession}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star text-sm ${
                          i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">{t('product.priceUnit') || 'Price per'} {product.unit || 'unit'}</p>
                <p className="text-3xl font-bold text-emerald-600 mb-4">CFA {parseFloat(product.price)?.toLocaleString() || '0'}</p>

                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">{t('product.availableQty') || 'Available Quantity'}</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {product.quantityAvailable || product.quantity} {product.unit || 'units'} available
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-600 text-sm mb-2">{t('product.qtyPurchase') || 'Quantity to Purchase'}</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 text-dark-green px-3 py-2 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-3 py-2 border rounded text-center focus:outline-none focus:border-primary-green"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-gray-200 text-dark-green px-3 py-2 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary-green text-white py-3 rounded-lg font-bold hover:bg-dark-green transition mb-3"
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  {t('product.addToCart') || 'Add to Cart'}
                </button>
                {user && user.id !== product.sellerId && (
                  <button
                    onClick={handleContactSeller}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-comment"></i>
                    {t('buyer.talkToSeller')}
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-dark-green mb-2">{t('product.description') || 'Description'}</h3>
                <p className="text-gray-700">{translatedFields.description || product.description || t('product.noDescription') || 'No description provided'}</p>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-700 font-medium mb-2">{t('product.contactSeller') || 'Contact Seller'}</p>
                {product.whatsapp && (
                  <a
                    href={`https://wa.me/${product.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-2"
                  >
                    <i className="fab fa-whatsapp"></i>
                    WhatsApp: {product.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seller Reviews and Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Reviews */}
          <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-dark-green mb-6">{t('product.sellerReviews') || 'Seller Reviews'}</h2>

            {user && user.role === 'buyer' && (
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="flex-1 bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition"
                >
                  <i className="fas fa-star mr-2"></i>
                  {t('product.leaveReview') || 'Leave a Review'}
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition"
                >
                  <i className="fas fa-flag mr-2"></i>
                  {t('product.reportSeller') || 'Report Seller'}
                </button>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-comments text-4xl mb-4"></i>
                <p>{t('product.noReviews') || 'No reviews yet'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-l-4 border-emerald-500 pl-4 py-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-bold">
                          {review.buyer?.name?.[0]?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{review.buyer?.name}</p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star text-sm ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
            <h3 className="text-xl font-bold text-dark-green mb-6">{t('product.sellerSummary') || 'Seller Summary'}</h3>

            <div className="space-y-4">
              <div className="text-center pb-4 border-b-2">
                <p className="text-4xl font-bold text-yellow-400">{averageRating.toFixed(1)}</p>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    ></i>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm mb-1">{t('buyer.seller')}</p>
                <p className="font-bold text-gray-800">{seller?.name}</p>
              </div>

              {seller?.profession && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">{t('buyer.profession')}</p>
                  <p className="font-bold text-gray-800 capitalize">{seller.profession}</p>
                </div>
              )}

              <div className="pt-4">
                <p className="text-xs text-gray-500 text-center">
                  {t('product.sellerReviewCount', { count: totalReviews })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRatingModal && (
        <RatingModal
          sellerId={product.sellerId}
          onClose={() => setShowRatingModal(false)}
          onReviewAdded={handleReviewAdded}
        />
      )}

      {showReportModal && (
        <ReportModal
          reportedSellerId={product.sellerId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
