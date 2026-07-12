const sections = [["Information We Collect", "We collect account information such as your name and email address, along with optional profile details, ratings, and watchlist selections you choose to save."], ["How We Use Your Information", "Information is used to authenticate your account and provide your saved preferences, ratings, watchlist, and personalised experience."], ["Data Storage", "Account-related information is stored in the project database. We aim to use reasonable safeguards, but this academic project is not intended for sensitive personal information."], ["Third-Party Services", "Movie information and images are supplied by TMDB. Their services may process requests according to their own privacy practices."], ["Contact for Privacy Concerns", "For questions about privacy in this project, contact support@nfakengine.example."]];

function Privacy() {
  return <div className="page-shell"><div className="max-w-3xl"><p className="section-kicker">Legal</p><h1 className="page-title">Privacy Policy</h1><p className="mt-4 text-sm text-zinc-500">Last updated: {new Date().getFullYear()}</p><div className="mt-8 space-y-7">{sections.map(([title, content]) => <section key={title}><h2 className="font-display text-xl font-bold text-zinc-100">{title}</h2><p className="mt-2 leading-7 text-zinc-400">{content}</p></section>)}</div></div></div>;
}

export default Privacy;
