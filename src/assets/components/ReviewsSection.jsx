import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getReviews, checkReviewEligibility, submitReview } from '../../config/supabase';

export default function ReviewsSection({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchReviewsData();
    }
  }, [listingId]);

  const fetchReviewsData = async () => {
    setLoading(true);
    // Ejecutamos ambas consultas en paralelo para mayor velocidad
    const [reviewsData, eligibilityData] = await Promise.all([
      getReviews(listingId),
      checkReviewEligibility(listingId)
    ]);

    if (!reviewsData.error) setReviews(reviewsData.data || []);
    setIsEligible(eligibilityData);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación (estrellas).');
      return;
    }
    if (!comment.trim()) {
      toast.error('Por favor, escribe un comentario.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await submitReview(listingId, rating, comment);
      if (error) throw error;
      
      toast.success('¡Gracias por tu reseña!');
      setRating(0);
      setComment('');
      setIsEligible(false); // Ya no es elegible tras comentar
      fetchReviewsData(); // Recargar la lista
    } catch (error) {
      toast.error('Hubo un error al enviar tu reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-6 animate-pulse bg-gray-200 dark:bg-gray-800 h-24 rounded-xl w-full"></div>;
  }

  // Calcular promedio
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-10">
      
      {/* Encabezado de Reseñas */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-rose-500">★</span> {reviews.length > 0 ? averageRating : 'Nuevo'}
        </h3>
        <span className="text-gray-500 font-medium">·</span>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>

      {/* Formulario (Solo visible si el usuario es elegible) */}
      {isEligible && (
        <form id="reviews-section-form" onSubmit={handleSubmit} className="mb-10 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h4 className="font-bold mb-3 text-gray-900 dark:text-white">Califica tu estancia</h4>
          
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              >
                <span className={star <= (hoverRating || rating) ? "text-rose-500" : "text-gray-300 dark:text-gray-700"}>
                  ★
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Cómo fue tu experiencia en este alojamiento?"
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4 text-sm text-gray-900 dark:text-white resize-none"
            rows="3"
            maxLength="500"
          ></textarea>

          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Publicar reseña'}
          </button>
        </form>
      )}

      {/* Lista de Comentarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                {review.profiles?.avatar_url ? (
                  <img src={review.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold uppercase">
                    {review.profiles?.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                  {review.profiles?.full_name || 'Usuario'}
                </h5>
                <p className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < review.rating ? "text-rose-500" : "text-gray-300 dark:text-gray-700"}`}>★</span>
              ))}
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}