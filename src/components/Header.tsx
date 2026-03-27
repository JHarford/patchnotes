import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid #2a2a3a",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#6366f1",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "2px",
          textDecoration: "none",
        }}
      >
        PATCH NOTES
      </Link>
      <Link
        href="/archive"
        style={{
          color: "#8888a0",
          fontSize: "14px",
          textDecoration: "none",
        }}
      >
        Archive
      </Link>
    </header>
  );
}
