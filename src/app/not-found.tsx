import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Страница не найдена</h1>
      <p className="lead">Возможно, ссылка устарела или в адресе опечатка.</p>
      <p>
        <Link href="/" className="btn">
          К списку тестов
        </Link>
      </p>
    </>
  );
}
