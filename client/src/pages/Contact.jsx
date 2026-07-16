import { useState } from "react";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event) => { event.preventDefault(); setSubmitted(true); };
  return <div className="page-shell"><div className="max-w-xl"><p className="section-kicker">Get in touch</p><h1 className="page-title">Contact us</h1><p className="mt-4 leading-7 text-zinc-400">For general questions about this academic project, write to <a href="mailto:support@novexa.example" className="text-amber hover:text-amber-soft">support@novexa.example</a>.</p><form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-line bg-panel p-5 sm:p-7"><label className="block text-sm font-medium text-zinc-300">Name<input required className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" /></label><label className="block text-sm font-medium text-zinc-300">Email<input required type="email" className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" /></label><label className="block text-sm font-medium text-zinc-300">Message<textarea required rows="5" className="mt-2 w-full resize-y rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" /></label>{submitted && <p className="text-sm text-emerald-300">Thanks for your message. This demonstration form does not send email.</p>}<button className="primary-button" type="submit">Send message</button></form></div></div>;
}

export default Contact;
