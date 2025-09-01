// --- Star rating setup (same as before) ---
const ratingEl = document.getElementById("rating");
const stars = [];
let selectedRating = 0;

for (let i = 1; i <= 5; i++) {
  const star = document.createElement("span");
  star.classList.add("star");
  star.dataset.value = i;
  star.textContent = "★";
  ratingEl.appendChild(star);
  stars.push(star);

  star.addEventListener("mouseenter", () => highlightStars(i));
  star.addEventListener("mouseleave", resetStars);
  star.addEventListener("click", () => {
    selectedRating = i;
    highlightStars(i, true);
  });
}

function highlightStars(index, lock = false) {
  stars.forEach((s, i) => {
    s.classList.toggle("selected", i < index);
  });
  if (!lock) stars.forEach((s, i) => s.classList.toggle("hovered", i < index));
}

function resetStars() {
  stars.forEach((s) => s.classList.remove("hovered"));
  highlightStars(selectedRating, true);
}

// --- Form submission ---
const form = document.getElementById("reviewForm");
const reviewList = document.getElementById("reviewList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const restaurant = document.getElementById("restaurant").value;
  const city = document.getElementById("city").value;
  const date = document.getElementById("date").value;
  const comments = document.getElementById("comments").value;

  if (selectedRating === 0) {
    alert("Please select a rating!");
    return;
  }

  // send to backend
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      restaurant,
      city,
      date,
      rating: selectedRating,
      comments
    })
  });

  if (res.ok) {
    loadReviews();
    form.reset();
    selectedRating = 0;
    resetStars();
  }
});

// --- Load reviews from backend ---
async function loadReviews() {
  const res = await fetch("/api/reviews");
  const reviews = await res.json();

  reviewList.innerHTML = "";
  reviews.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.restaurant}</strong> – ${r.city}<br>
      Date: ${r.date}<br>
      Rating: ${"★".repeat(r.rating)}<br>
      <em>${r.comments || "No comments"}</em>
    `;
    reviewList.appendChild(li);
  });
}

loadReviews();
