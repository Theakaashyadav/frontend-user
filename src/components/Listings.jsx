import { useState, useEffect } from "react";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("http://localhost:4000/listings") // your backend endpoint
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const openModal = (listing) => {
    setSelectedListing(listing);
    setCurrentIndex(0);
  };

  const closeModal = () => setSelectedListing(null);

  const nextImage = () =>
    setCurrentIndex((prev) =>
      prev === selectedListing.images.length - 1 ? 0 : prev + 1
    );

  const prevImage = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? selectedListing.images.length - 1 : prev - 1
    );

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {listings.map((listing) => (
        <div
          key={listing._id}
          className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
          onClick={() => openModal(listing)}
        >
          <img
            src={listing.images[0]} // show first image
            alt={listing.title}
            className="h-48 w-full object-cover"
          />
          <div className="p-4">
            <h2 className="text-lg font-bold">{listing.title}</h2>
            <p className="text-gray-600">{listing.description}</p>
            <p className="text-green-700 font-semibold">₹{listing.price}</p>
          </div>
        </div>
      ))}

      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-white text-2xl"
          >
            ✕
          </button>

          <button
            onClick={prevImage}
            className="absolute left-10 text-white text-3xl"
          >
            ‹
          </button>

          <img
            src={selectedListing.images[currentIndex]}
            alt="property"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
          />

          <button
            onClick={nextImage}
            className="absolute right-10 text-white text-3xl"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
