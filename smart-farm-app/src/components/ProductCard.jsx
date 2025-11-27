import React from 'react';

const ProductCard = ({ product }) => {
  const imageUrl = product.image ? (product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${product.image}` : product.image) : '';
  const message = `Hello, I am interested in your product: ${product.name} listed on Smart Farm. Price: ${product.price}. ${imageUrl ? ` View here: ${imageUrl}` : ''}`;
  const whatsappLink = `https://wa.me/${product.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:-translate-y-1 transition duration-200">
      <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
        {product.image ? (
          <img
            src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${product.image}` : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <i className={`fas ${product.icon || 'fa-box'} fa-3x`}></i>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
        <p className="text-dark-green font-bold text-xl mt-1">{product.price}</p>
        <div className="text-sm text-gray-500 mt-2 space-y-1">
          <p><i className="fas fa-map-marker-alt mr-2"></i> {product.location}</p>
          <p><i className="fas fa-box mr-2"></i> {product.quantity}</p>
        </div>
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{product.description}</p>
        <a
          href={whatsappLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-[#25D366] text-white text-center py-2 rounded mt-4 font-bold hover:bg-green-600 transition"      
        >
          <i className="fab fa-whatsapp mr-2"></i> Chat with Farmer
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
