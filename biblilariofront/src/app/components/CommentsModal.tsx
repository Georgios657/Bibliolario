import { X, Star, User } from 'lucide-react';
import { Book, Review } from './BookTable';

interface CommentsModalProps {
  book: Book | null;
  onClose: () => void;
}

export function CommentsModal({ book, onClose }: CommentsModalProps) {
  if (!book) return null;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingPill = (label: string, value: number) => {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <span className="text-xs text-gray-600">{label}:</span>
        <span className="text-xs font-semibold text-gray-800">{value.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold mb-1">{book.title}</h2>
            <p className="text-sm text-indigo-100">
              von {book.authors.join(', ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Book Info */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200">
                <span className="text-xs text-gray-600">Sprache:</span>
                <span className="text-xs font-semibold text-gray-800">
                  {book.language}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200">
                <span className="text-xs text-gray-600">Veröffentlicht:</span>
                <span className="text-xs font-semibold text-gray-800">
                  {book.publishedDate}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                <span className="text-xs text-gray-600">Sterne:</span>
                {renderStars(book.ratings.stars)}
                <span className="text-xs font-semibold">
                  {book.ratings.stars.toFixed(1)}
                </span>
              </div>
              {renderRatingPill('Qualität', book.ratings.quality)}
              {renderRatingPill('Fetisch', book.ratings.fetish)}
              {renderRatingPill('Cover', book.ratings.cover)}
            </div>
          </div>

          {/* Reviews */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Kommentare ({book.reviews.length})
            </h3>
            
            {book.reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Noch keine Kommentare vorhanden
              </p>
            ) : (
              <div className="space-y-4">
                {book.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {review.userName}
                          </p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                      </div>
                    </div>



                    {/* Review Comment */}
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
