function SolarVisual() {
  return (
    <svg
      viewBox="0 0 600 360"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="vSolarGrid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern id="panels" width="6" height="6" patternUnits="userSpaceOnUse">
          <path
            d="M 6 0 L 0 0 0 6"
            fill="none"
            stroke="rgba(216,57,47,0.55)"
            strokeWidth="0.5"
          />
        </pattern>
        <radialGradient id="solarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(196,166,97,0.15)" />
          <stop offset="100%" stopColor="rgba(196,166,97,0)" />
        </radialGradient>
      </defs>
      <rect width="600" height="360" fill="#1A1612" />
      <rect width="600" height="360" fill="url(#vSolarGrid)" />

      <circle cx="540" cy="40" r="80" fill="url(#solarGlow)" />

      <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.7">
        <line x1="0" y1="120" x2="600" y2="120" />
        <line x1="0" y1="240" x2="600" y2="240" />
        <line x1="160" y1="0" x2="160" y2="360" />
        <line x1="320" y1="0" x2="320" y2="360" />
        <line x1="460" y1="0" x2="460" y2="360" />
      </g>

      {/* Row 1: Top */}
      <g>
        <rect x="20" y="30" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="85" y="30" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="180" y="30" width="55" height="42" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="250" y="30" width="55" height="42" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="340" y="30" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="400" y="30" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="475" y="30" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="535" y="30" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="20" y="80" width="50" height="32" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="85" y="80" width="50" height="32" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
      </g>

      {/* Row 2: Middle */}
      <g>
        <rect x="20" y="140" width="55" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="90" y="140" width="55" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />

        {/* Gold candidate */}
        <g>
          <rect x="180" y="140" width="60" height="44" rx="2" fill="rgba(196,166,97,0.15)" stroke="#C4A661" strokeWidth="1.2" />
          <rect x="186" y="146" width="48" height="32" fill="rgba(196,166,97,0.25)" />
          <g stroke="rgba(196,166,97,0.6)" strokeWidth="0.4">
            <line x1="198" y1="146" x2="198" y2="178" />
            <line x1="210" y1="146" x2="210" y2="178" />
            <line x1="222" y1="146" x2="222" y2="178" />
            <line x1="186" y1="158" x2="234" y2="158" />
            <line x1="186" y1="170" x2="234" y2="170" />
          </g>
        </g>

        <rect x="255" y="140" width="55" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />

        {/* Primary red candidate */}
        <g>
          <rect x="340" y="138" width="68" height="48" rx="2" fill="rgba(216,57,47,0.18)" stroke="#D8392F" strokeWidth="1.5" />
          <rect x="346" y="144" width="56" height="36" fill="rgba(216,57,47,0.22)" />
          <g stroke="rgba(216,57,47,0.7)" strokeWidth="0.5">
            <line x1="360" y1="144" x2="360" y2="180" />
            <line x1="374" y1="144" x2="374" y2="180" />
            <line x1="388" y1="144" x2="388" y2="180" />
            <line x1="346" y1="156" x2="402" y2="156" />
            <line x1="346" y1="168" x2="402" y2="168" />
          </g>
          <circle className="signal-pulse" cx="374" cy="162" r="3" fill="#D8392F" />
        </g>

        <rect x="420" y="140" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="480" y="140" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
      </g>

      {/* Row 3: Bottom */}
      <g>
        <rect x="20" y="260" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="85" y="260" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="180" y="260" width="55" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="250" y="260" width="55" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="340" y="260" width="55" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <rect x="405" y="260" width="50" height="40" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />

        {/* Tertiary red candidate */}
        <g>
          <rect x="475" y="258" width="55" height="44" rx="2" fill="rgba(216,57,47,0.15)" stroke="#D8392F" strokeWidth="1.2" />
          <rect x="481" y="264" width="43" height="32" fill="rgba(216,57,47,0.18)" />
          <g stroke="rgba(216,57,47,0.6)" strokeWidth="0.4">
            <line x1="495" y1="264" x2="495" y2="296" />
            <line x1="509" y1="264" x2="509" y2="296" />
            <line x1="481" y1="276" x2="524" y2="276" />
            <line x1="481" y1="286" x2="524" y2="286" />
          </g>
        </g>
      </g>

      {/* Annotation line + score */}
      <g stroke="#D8392F" strokeWidth="0.8" fill="none">
        <line x1="408" y1="162" x2="455" y2="220" strokeDasharray="2 3" />
        <circle cx="455" cy="220" r="2.5" fill="#D8392F" />
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.55)">
        <text x="463" y="218">INITIAL FIT</text>
        <text x="463" y="240" fontSize="22" fontWeight="700" fill="#D8392F">94%</text>
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(196,166,97,0.7)">
        <text x="540" y="32" textAnchor="middle">↓</text>
        <text x="540" y="62" textAnchor="middle" fontSize="8">S 184°</text>
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">
        <text x="20" y="345">3 candidates · ranked by ownership · equity · rate spread · roof</text>
      </g>
    </svg>
  );
}

function ConversionVisual() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="v1grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="300" fill="#1A1612" />
      <rect width="600" height="300" fill="url(#v1grid)" />
      <g fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7">
        <rect x="60" y="100" width="40" height="180" />
        <rect x="105" y="80" width="50" height="200" />
        <rect x="160" y="120" width="35" height="160" />
        <rect x="200" y="60" width="55" height="220" />
        <rect x="260" y="100" width="40" height="180" />
      </g>
      <g fill="rgba(255,255,255,0.2)">
        <rect x="115" y="100" width="6" height="6" /><rect x="125" y="100" width="6" height="6" /><rect x="135" y="100" width="6" height="6" />
        <rect x="115" y="115" width="6" height="6" /><rect x="125" y="115" width="6" height="6" /><rect x="135" y="115" width="6" height="6" />
        <rect x="115" y="130" width="6" height="6" /><rect x="125" y="130" width="6" height="6" /><rect x="135" y="130" width="6" height="6" />
        <rect x="115" y="145" width="6" height="6" /><rect x="125" y="145" width="6" height="6" /><rect x="135" y="145" width="6" height="6" />
      </g>
      <rect x="200" y="60" width="55" height="220" fill="rgba(216,57,47,0.15)" stroke="#D8392F" strokeWidth="1.2" />
      <g fill="#D8392F" opacity="0.85">
        <rect x="210" y="80" width="6" height="6" /><rect x="220" y="80" width="6" height="6" /><rect x="230" y="80" width="6" height="6" /><rect x="240" y="80" width="6" height="6" />
        <rect x="210" y="100" width="6" height="6" /><rect x="220" y="100" width="6" height="6" /><rect x="240" y="100" width="6" height="6" />
        <rect x="210" y="120" width="6" height="6" /><rect x="230" y="120" width="6" height="6" />
      </g>
      <g stroke="#D8392F" strokeWidth="0.8" fill="none">
        <line x1="255" y1="60" x2="380" y2="60" />
        <circle cx="380" cy="60" r="3" fill="#D8392F" />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(255,255,255,0.65)">
        <text x="395" y="55">CONVERSION SCORE</text>
        <text x="395" y="78" fontSize="26" fill="#D8392F" fontWeight="700">87%</text>
        <text x="395" y="105">ZONING — eligible</text>
        <text x="395" y="120">DEBT — at-risk</text>
        <text x="395" y="135">ABATEMENT — qualifies</text>
        <text x="395" y="150">ABSORPTION — strong</text>
      </g>
      <line x1="0" y1="280" x2="600" y2="280" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
    </svg>
  );
}

function DistressVisual() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="v2grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="300" fill="#1A1612" />
      <rect width="600" height="300" fill="url(#v2grid)" />

      <g stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none">
        <line x1="80" y1="80" x2="180" y2="120" />
        <line x1="180" y1="120" x2="280" y2="80" />
        <line x1="280" y1="80" x2="380" y2="160" />
        <line x1="380" y1="160" x2="480" y2="120" />
        <line x1="180" y1="120" x2="280" y2="180" />
        <line x1="280" y1="180" x2="380" y2="160" />
        <line x1="280" y1="180" x2="380" y2="240" />
      </g>

      <g>
        <circle cx="80" cy="80" r="14" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" />
        <text x="80" y="85" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.7)">E</text>

        <circle cx="180" cy="120" r="14" fill="rgba(196,166,97,0.15)" stroke="rgba(196,166,97,0.7)" />
        <text x="180" y="125" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="rgba(196,166,97,1)">O</text>

        <circle cx="280" cy="80" r="14" fill="rgba(196,166,97,0.15)" stroke="rgba(196,166,97,0.7)" />
        <text x="280" y="85" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="rgba(196,166,97,1)">D</text>

        <circle cx="380" cy="160" r="22" fill="rgba(216,57,47,0.2)" stroke="#D8392F" strokeWidth="1.5" />
        <circle className="signal-pulse" cx="380" cy="160" r="14" fill="#D8392F" />
        <text x="380" y="166" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="white" fontWeight="700">!</text>

        <circle cx="280" cy="180" r="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" />
        <text x="280" y="185" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.8)">A</text>

        <circle cx="480" cy="120" r="14" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" />
        <text x="480" y="125" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.6)">L</text>

        <circle cx="380" cy="240" r="14" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" />
        <text x="380" y="245" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.6)">P</text>
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.45)">
        <text x="80" y="55" textAnchor="middle">SOS dissolved</text>
        <text x="180" y="150" textAnchor="middle">Owner shift</text>
        <text x="280" y="55" textAnchor="middle">Debt event</text>
        <text x="380" y="135" textAnchor="middle" fill="#D8392F" fontWeight="600">DISTRESS DETECTED</text>
        <text x="280" y="210" textAnchor="middle">Asset</text>
        <text x="480" y="150" textAnchor="middle">Lien</text>
        <text x="380" y="270" textAnchor="middle">Filing</text>
      </g>

      <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.5">
        <line x1="40" y1="295" x2="560" y2="295" strokeDasharray="2 3" />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(255,255,255,0.35)">
        <text x="40" y="290">T-90d</text>
        <text x="560" y="290" textAnchor="end">NOW</text>
      </g>
    </svg>
  );
}

function OutreachVisual() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="v3grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="300" fill="#1A1612" />
      <rect width="600" height="300" fill="url(#v3grid)" />

      <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.7">
        <line x1="0" y1="100" x2="600" y2="100" />
        <line x1="0" y1="200" x2="600" y2="200" />
        <line x1="150" y1="0" x2="150" y2="300" />
        <line x1="300" y1="0" x2="300" y2="300" />
        <line x1="450" y1="0" x2="450" y2="300" />
      </g>

      <g>
        <rect x="30" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="80" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="180" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="230" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        <rect x="330" y="50" width="40" height="30" fill="rgba(216,57,47,0.2)" stroke="#D8392F" strokeWidth="1.2" />
        <circle className="signal-pulse" cx="350" cy="65" r="3" fill="#D8392F" />
        <circle className="signal-pulse" cx="350" cy="65" r="9" fill="rgba(216,57,47,0.3)" />

        <rect x="380" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="480" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="530" y="50" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        <rect x="30" y="130" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="80" y="130" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        <rect x="180" y="130" width="40" height="30" fill="rgba(196,166,97,0.2)" stroke="#C4A661" strokeWidth="1.2" />
        <circle className="signal-pulse signal-pulse-2" cx="200" cy="145" r="3" fill="#C4A661" />

        <rect x="230" y="130" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="330" y="130" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="380" y="130" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        <rect x="480" y="130" width="40" height="30" fill="rgba(216,57,47,0.2)" stroke="#D8392F" strokeWidth="1.2" />
        <circle className="signal-pulse signal-pulse-3" cx="500" cy="145" r="3" fill="#D8392F" />

        <rect x="530" y="130" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        <rect x="30" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="80" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="180" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="230" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="330" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="380" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="480" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="530" y="220" width="40" height="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
        <text x="30" y="290">3 households · payment shock + court activity · pre-filing</text>
      </g>
    </svg>
  );
}

function InfraVisual() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="v4grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="300" fill="#1A1612" />
      <rect width="600" height="300" fill="url(#v4grid)" />

      <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" fill="none">
        <path d="M 0 100 Q 100 90, 200 110 T 400 100 T 600 120" />
        <path d="M 0 140 Q 100 130, 200 150 T 400 140 T 600 160" />
        <path d="M 0 180 Q 100 170, 200 190 T 400 180 T 600 200" />
        <path d="M 0 220 Q 100 210, 200 230 T 400 220 T 600 240" />
      </g>

      <g stroke="rgba(196,166,97,0.4)" strokeWidth="0.8" fill="none" strokeDasharray="2 2">
        <line x1="0" y1="80" x2="600" y2="60" />
        <line x1="0" y1="270" x2="600" y2="250" />
      </g>

      <g stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none">
        <path d="M 100 80 L 100 120" />
        <path d="M 95 90 L 105 90" />
        <path d="M 95 100 L 105 100" />

        <path d="M 250 60 L 250 110" />
        <path d="M 245 70 L 255 70" />
        <path d="M 245 80 L 255 80" />

        <path d="M 480 65 L 480 115" />
        <path d="M 475 75 L 485 75" />
        <path d="M 475 85 L 485 85" />
      </g>

      <g>
        <rect x="180" y="170" width="80" height="50" fill="rgba(216,57,47,0.2)" stroke="#D8392F" strokeWidth="1.5" />
        <circle className="signal-pulse" cx="220" cy="195" r="4" fill="#D8392F" />
        <circle className="signal-pulse" cx="220" cy="195" r="12" fill="rgba(216,57,47,0.3)" />

        <rect x="380" y="180" width="60" height="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="480" y="190" width="50" height="35" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.6)">
        <line x1="260" y1="195" x2="350" y2="195" stroke="#D8392F" strokeWidth="0.8" />
        <text x="360" y="180" fontSize="10">SITE SCORE</text>
        <text x="360" y="206" fontSize="26" fill="#D8392F" fontWeight="700">9.4</text>
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(196,166,97,0.7)">
        <text x="20" y="290">PWR · WTR · FIB · ZON · CLM · LND</text>
      </g>
    </svg>
  );
}

export function UseCases() {
  return (
    <section className="possibilities" id="possibilities">
      <div className="container">
        <div className="possibilities-header">
          <div className="eyebrow on-light">§ 02 — Use cases</div>
          <h2>
            What people ask <span className="accent">Atlas</span> to find.
          </h2>
          <p>Each one started with someone asking us a question. If you&apos;ve got one, ask.</p>
        </div>
        <div className="vignettes">
          <article className="vignette vignette-featured">
            <div className="vignette-visual">
              <SolarVisual />
            </div>
            <div className="vignette-body">
              <div className="vignette-tag">
                <span className="vignette-num">01 /</span>
                <span className="vignette-cat">Solar</span>
              </div>
              <h3>When a solar installer needs to find homes that will actually convert.</h3>
              <p>Who owns the home, how much equity they have, what they pay for power, whether the roof works, what incentives apply. Atlas figures out who&apos;s actually worth knocking on.</p>
            </div>
          </article>

          <article className="vignette">
            <div className="vignette-visual">
              <ConversionVisual />
            </div>
            <div className="vignette-body">
              <div className="vignette-tag">
                <span className="vignette-num">02 /</span>
                <span className="vignette-cat">Conversion</span>
              </div>
              <h3>When a developer asks which downtown towers could become homes.</h3>
              <p>Whether the zoning allows it, whether the owner is in trouble, whether the math works on tax abatements, whether the rental market can absorb the units. Atlas pulls it together.</p>
            </div>
          </article>

          <article className="vignette">
            <div className="vignette-visual">
              <DistressVisual />
            </div>
            <div className="vignette-body">
              <div className="vignette-tag">
                <span className="vignette-num">03 /</span>
                <span className="vignette-cat">Distress</span>
              </div>
              <h3>When a fund needs to spot stress before it shows in price.</h3>
              <p>We watch entity filings, ownership changes, missed payments, court activity, asset condition. When stress shows up across more than one of these at once, that usually means something.</p>
            </div>
          </article>

          <article className="vignette">
            <div className="vignette-visual">
              <OutreachVisual />
            </div>
            <div className="vignette-body">
              <div className="vignette-tag">
                <span className="vignette-num">04 /</span>
                <span className="vignette-cat">Outreach</span>
              </div>
              <h3>When a counselor needs to reach a family before the notice arrives.</h3>
              <p>Households where the bills got harder, the courts got involved, and the equity is still there to lose. Atlas finds them before the filing does.</p>
            </div>
          </article>

          <article className="vignette">
            <div className="vignette-visual">
              <InfraVisual />
            </div>
            <div className="vignette-body">
              <div className="vignette-tag">
                <span className="vignette-num">05 /</span>
                <span className="vignette-cat">Infrastructure</span>
              </div>
              <h3>When an operator picks where to build the next data center.</h3>
              <p>Power, water, fiber, zoning, climate, land. Atlas scores sites on what actually matters for building.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
