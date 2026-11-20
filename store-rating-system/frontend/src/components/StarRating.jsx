import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  interactive = false,
  onRate,
  size = 20,
  showLabel = false,
  totalReviews = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const labels = {
    1: 'Poor (1)',
    2: 'Fair (2)',
    3: 'Good (3)',
    4: 'Very Good (4)',
    5: 'Excellent (5)'
  };

  const currentVal = hoverRating || rating || 0;

  return (
    <div className="star-rating-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'inline-flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= currentVal;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: interactive ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease'
              }}
              title={interactive ? labels[starValue] : `${rating} out of 5`}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                color={isFilled ? '#f59e0b' : '#cbd5e1'}
                strokeWidth={isFilled ? 0 : 2}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
          {Number(rating).toFixed(1)}
          {totalReviews !== null && (
            <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
              ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
