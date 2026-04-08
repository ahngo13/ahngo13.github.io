import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-sm font-semibold text-emerald-700">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동됐을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← 홈으로
      </Link>
    </div>
  );
}
