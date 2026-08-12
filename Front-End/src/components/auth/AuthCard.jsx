import logo from "../../assets/logo-edutrack.svg";

export default function AuthCard({ title, description, children }) {
  return (
    <main className="auth-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="auth-card-enter w-full max-w-[400px] rounded-2xl bg-white px-6 py-7 shadow-card sm:px-7">
        <header className="text-center">
          <img src={logo} alt="EduTrack" className="mx-auto h-10 w-10" />
          <h1 className="mt-4 text-xl font-bold tracking-[-0.035em] text-[#20232D]">{title}</h1>
          <p className="mx-auto mt-2 max-w-[320px] text-xs leading-5 text-[#555B6B]">{description}</p>
        </header>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
