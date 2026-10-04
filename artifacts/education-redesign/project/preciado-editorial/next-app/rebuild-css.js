const fs = require('fs');
const path = require('path');

const designCssPath = path.join(__dirname, '../assets/design.css');
const globalsCssPath = path.join(__dirname, 'src/app/globals.css');

let content = '@import "tailwindcss";\n\n';
content += fs.readFileSync(designCssPath, 'utf8');
content += `

/* --- PREMIUM BOOKS SECTION --- */
.books-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin-top: 48px;
}
.book-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.book-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
  border-color: var(--rust);
}
.book-cover {
  width: 100%;
  aspect-ratio: 0.75;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.15);
  margin-bottom: 8px;
  transition: transform 0.5s ease;
}
.book-card:hover .book-cover {
  transform: scale(1.03) rotate(-1deg);
}
.book-card h3 {
  font-size: 24px !important;
  line-height: 1.2 !important;
  margin: 0 !important;
  font-family: var(--serif);
}
.book-card .book-intro {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
  flex-grow: 1;
}
.book-card ul {
  padding-left: 18px;
  margin: 16px 0;
  font-size: 13px;
  color: var(--ink);
}
.book-card ul li {
  margin-bottom: 8px;
}
.book-reason {
  background: var(--sage);
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  font-style: italic;
  margin-top: 16px;
}
.book-reason strong {
  font-style: normal;
  display: block;
  margin-bottom: 4px;
  font-family: var(--sans);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--forest);
}

@media (max-width: 900px) {
  .books-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
`;

fs.writeFileSync(globalsCssPath, content);
console.log('globals.css rebuilt successfully');
