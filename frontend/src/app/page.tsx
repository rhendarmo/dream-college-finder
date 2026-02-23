export default async function Home() {
  const res = await fetch("http://127.0.0.1:8000/health", { cache: "no-store" });
  const data = await res.json();

  return (
    <main style={{ padding: 24 }}>
      <h1>DreamCollegeFinder</h1>
      <p>Backend health: {data.status}</p>
    </main>
  );
}