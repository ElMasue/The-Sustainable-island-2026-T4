interface FountainDetailLightboxProps {
  images: string[];
  expandedImageIndex: number;
  fountainName: string;
  closeLightbox: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export function FountainDetailLightbox({
  images,
  expandedImageIndex,
  fountainName,
  closeLightbox,
  nextImage,
  prevImage,
}: FountainDetailLightboxProps) {
  return (
    <div className="image-lightbox" onClick={closeLightbox}>
      <button
        className="lightbox-close"
        onClick={closeLightbox}
        aria-label="Close"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous image"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next image"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <img
        src={images[expandedImageIndex]}
        alt={`${fountainName} ${expandedImageIndex + 1}`}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="lightbox-counter">
          {expandedImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
