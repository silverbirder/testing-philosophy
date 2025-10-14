import { useEffect, useState } from "react";

type Breed = {
  id: string;
  name: string;
  description: string;
  origin: string;
};

export const CatBrowser = () => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  // 一覧取得
  useEffect(() => {
    fetch("https://api.thecatapi.com/v1/breeds")
      .then((res) => res.json())
      .then((data) => setBreeds(data))
      .catch((err) => console.error("一覧取得失敗:", err));
  }, []);

  // 検索処理
  const handleSearch = async () => {
    if (!search.trim()) return;
    const res = await fetch(
      `https://api.thecatapi.com/v1/breeds/search?q=${encodeURIComponent(
        search
      )}`
    );
    const data = await res.json();
    setBreeds(data);
  };

  // クリックした猫の画像を取得
  const handleSelect = async (breed: Breed) => {
    setSelectedBreed(breed);
    const res = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}`
    );
    const data = await res.json();
    setImageUrl(data[0]?.url ?? "");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h1>🐱 猫図鑑</h1>

      {/* 検索フォーム */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="品種名で検索 (例: siamese)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>検索</button>
      </div>

      {/* 猫一覧 */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {breeds.map((b) => (
          <li
            key={b.id}
            style={{
              borderBottom: "1px solid #ddd",
              cursor: "pointer",
              padding: "8px",
            }}
            onClick={() => handleSelect(b)}
          >
            <strong>{b.name}</strong> ({b.origin})
          </li>
        ))}
      </ul>

      {/* 詳細表示 */}
      {selectedBreed && (
        <div style={{ marginTop: 20 }}>
          <h2>{selectedBreed.name}</h2>
          {imageUrl && (
            <img src={imageUrl} alt={selectedBreed.name} width={400} />
          )}
          <p>{selectedBreed.description}</p>
        </div>
      )}
    </div>
  );
};
