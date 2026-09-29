function App() {
  const { TopBar } = window.DS;
  const [active, setActive] = React.useState(null);
  const map = { Atlas: 'atlas', 'How it works': 'how', Coverage: 'coverage', Documentation: 'how', cta: 'contact', home: 'top' };
  const go = v => { setActive(v); const el = document.getElementById(map[v]); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); };
  const links = ['Atlas', 'How it works', 'Coverage', 'Documentation'].map(l => ({ label: l, active: active === l }));
  return (
    <div data-product="red-planet" data-density="comfortable">
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}><TopBar links={links} cta={{ label: 'Get in touch' }} onNavigate={go} /></div>
      <Hero />
      <div style={{ display: 'grid', gap: 8, padding: '0 8px' }}>
        <MissionControl /><WhyDifferent /><HowItWorks /><Coverage /><Contact />
      </div>
    </div>
  );
}
