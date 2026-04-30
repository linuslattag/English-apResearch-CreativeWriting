window.SOURCE_COURT_DATA = (function () {
  const criteria = [
    {
      id: 'authority',
      label: 'Authority',
      short: 'AU',
      question: 'Does the author have real expertise or institutional standing in this field?',
      description: 'Check credentials, affiliations, expertise, and whether the source comes from someone qualified to make the claim.',
      teach: 'A polished source can still fail if the writer lacks actual subject-matter expertise.'
    },
    {
      id: 'currency',
      label: 'Currency',
      short: 'CU',
      question: 'Is the source recent enough for the topic it is addressing?',
      description: 'For fast-moving fields like science, technology, and medicine, stale evidence can wreck an argument.',
      teach: 'Older does not always mean useless, but topic speed matters.'
    },
    {
      id: 'rigor',
      label: 'Rigor',
      short: 'RG',
      question: 'Was the source vetted through peer review or another strong institutional process?',
      description: 'Peer-reviewed journals, major research institutes, and national academies usually beat blogs, marketing copy, or unvetted opinion.',
      teach: 'Good-looking formatting is not the same thing as evidence being reviewed.'
    },
    {
      id: 'objectivity',
      label: 'Objectivity',
      short: 'OB',
      question: 'Is the source informative rather than driven by hype, lobbying, or a sales agenda?',
      description: 'Watch for loaded diction, financial conflicts, lobbying goals, or emotional pressure dressed up as research.',
      teach: 'Bias is often easiest to spot in the source\'s purpose and tone.'
    }
  ];

  const personas = [
    {
      id: 'detective',
      name: 'The Detective',
      focus: 'authority',
      perk: 'Double note bonus on Authority checks.',
      powerTitle: 'Credential Spotlight',
      powerDesc: 'Once per run, reveal the strongest authority clue on the current source.',
      flavor: 'Great at checking whether someone has actually earned the microphone.'
    },
    {
      id: 'archivist',
      name: 'The Archivist',
      focus: 'currency',
      perk: 'Double note bonus on Currency checks.',
      powerTitle: 'Timeline Lens',
      powerDesc: 'Once per run, reveal the most important date-context clue on the current source.',
      flavor: 'Knows when an argument is running on expired evidence.'
    },
    {
      id: 'scholar',
      name: 'The Scholar',
      focus: 'rigor',
      perk: 'Double note bonus on Rigor checks.',
      powerTitle: 'Peer Review Pulse',
      powerDesc: 'Once per run, reveal the publication-vetting clue on the current source.',
      flavor: 'Zero patience for sources pretending to be more vetted than they are.'
    },
    {
      id: 'skeptic',
      name: 'The Skeptic',
      focus: 'objectivity',
      perk: 'Double note bonus on Objectivity checks.',
      powerTitle: 'Motive Scan',
      powerDesc: 'Once per run, reveal the strongest bias or purpose clue on the current source.',
      flavor: 'Excellent at sniffing out marketing, advocacy, and emotional overreach.'
    }
  ];

  const ranks = [
    { xp: 0, title: 'Probationary Clerk' },
    { xp: 120, title: 'Case Clerk' },
    { xp: 280, title: 'Research Magistrate' },
    { xp: 500, title: 'Associate Judge' },
    { xp: 780, title: 'Senior Judge' },
    { xp: 1120, title: 'Appellate Judge' },
    { xp: 1520, title: 'Chief Justice Candidate' },
    { xp: 1980, title: 'Chief Justice' }
  ];

  const dockets = [
    {
      id: 'orientation-docket',
      name: 'Orientation Docket',
      chapter: 'Chapter 1',
      promotion: 'Certified Clerk',
      theme: 'Learn the four-factor test before the bench gets impatient.',
      overview: 'Short, readable introductory cases that make the source-evaluation mission obvious.',
      cases: [
        {
          id: 'miracle-berry',
          title: 'The Miracle Berry That Melts Belly Fat Fast',
          author: 'Dr. Wellness (Blogger)',
          publication: 'Holistic Health Daily Blog',
          date: '2024',
          type: 'Blog / Supplement Advertisement',
          difficulty: 'Easy',
          skillFocus: 'Authority + Objectivity',
          excerpt:
            'Big Pharma does not want you to know about this Amazonian super-berry. Clinical trials are expensive, so we do not have them yet, but thousands of my customers swear by my $89 supplement. If you care about your family, buy now before regulators attack natural freedom again.',
          verdict: false,
          answers: {
            authority: false,
            currency: true,
            rigor: false,
            objectivity: false
          },
          clues: {
            authority: 'The title "Dr." is unsupported, and the source gives no institutional affiliation or field expertise.',
            currency: 'The date is current, but recency alone cannot rescue a weak source.',
            rigor: 'The excerpt admits there are no clinical trials, which means there is no meaningful vetting behind the claim.',
            objectivity: 'The piece uses fear, urgency, and a sales agenda rather than neutral explanation.'
          },
          verdictReason: 'Dismissed. It is current, but it fails authority, rigor, and objectivity in ways that make it unusable for academic research.',
          teachingPoint: 'A recent source can still be academically weak if it is selling, speculating, or pretending expertise.'
        },
        {
          id: 'sea-level',
          title: 'Global Sea-Level Rise Projections, 2020-2050',
          author: 'Dr. Elena Rostova, Ph.D.',
          publication: 'Nature Climate Change',
          date: '2023',
          type: 'Peer-Reviewed Academic Journal',
          difficulty: 'Easy',
          skillFocus: 'Rigor',
          excerpt:
            'Using satellite altimetry data from 1993 to 2022, this study projects a median sea-level increase of 0.25 meters by 2050 under the RCP4.5 emissions scenario. Margins of error were calculated through Monte Carlo simulation. Funding came from the National Science Foundation, and the authors declared no conflicts of interest.',
          verdict: true,
          answers: {
            authority: true,
            currency: true,
            rigor: true,
            objectivity: true
          },
          clues: {
            authority: 'The author is a credentialed climatologist writing within her field.',
            currency: 'A 2023 publication date is recent for climate projection research.',
            rigor: 'Nature Climate Change is a peer-reviewed academic journal with a strong vetting process.',
            objectivity: 'The excerpt uses measured methodology, transparent funding, and restrained language.'
          },
          verdictReason: 'Admissible. It is expert, current, peer-reviewed, and written in a neutral research voice.',
          teachingPoint: 'The strongest academic sources explain their methods, limits, and funding instead of hiding them.'
        },
        {
          id: 'dial-up-attention',
          title: 'The Internet\'s Effect on Adolescent Attention Spans',
          author: 'Dr. Marcus Vance, Cognitive Psychologist',
          publication: 'Journal of Educational Psychology',
          date: '1998',
          type: 'Peer-Reviewed Academic Journal',
          difficulty: 'Easy',
          skillFocus: 'Currency',
          excerpt:
            'Our study of 400 high school students indicates that spending more than two hours a week on World Wide Web chat rooms correlates with a 15% decrease in sustained reading focus. As dial-up modems become more common in households, educators must monitor this digital distraction carefully.',
          verdict: false,
          answers: {
            authority: true,
            currency: false,
            rigor: true,
            objectivity: true
          },
          clues: {
            authority: 'The author is qualified and working in a relevant field.',
            currency: 'The source predates smartphones, algorithmic feeds, and modern social media ecosystems by decades.',
            rigor: 'The journal is legitimate, but vetted does not automatically mean current enough.',
            objectivity: 'The language is measured and research-oriented, not emotionally manipulative.'
          },
          verdictReason: 'Dismissed. Even though it is scholarly, the evidence is too old for modern internet and social-media research.',
          teachingPoint: 'Currency can be the deciding factor even when the source looks strong on every other criterion.'
        }
      ]
    },
    {
      id: 'policy-floor',
      name: 'Policy Floor Docket',
      chapter: 'Chapter 2',
      promotion: 'Magistrate Promotion',
      theme: 'Public-facing reports get trickier when advocacy and credibility start blending together.',
      overview: 'These cases introduce reputable institutions, advocacy groups, and policy-style writing.',
      cases: [
        {
          id: 'city-heat-report',
          title: 'Extreme Heat and Student Attendance in Metro Schools',
          author: 'Office of Environmental Health Analytics',
          publication: 'State Department of Public Health',
          date: '2024',
          type: 'Government Research Report',
          difficulty: 'Medium',
          skillFocus: 'Authority + Objectivity',
          excerpt:
            'Across three urban districts, absences rose on days when classroom temperatures exceeded 82 degrees Fahrenheit. The report aggregates attendance records, nurse visits, and facility data from 2019 through 2024. Methods, limitations, and raw tables appear in the appendix.',
          verdict: true,
          answers: {
            authority: true,
            currency: true,
            rigor: true,
            objectivity: true
          },
          clues: {
            authority: 'A state public-health office has clear institutional authority on this topic.',
            currency: 'The report is recent and uses data through 2024.',
            rigor: 'It is not journal peer review, but the methods and appendix show strong institutional vetting and transparency.',
            objectivity: 'The language is analytical, and the report openly states its limits.'
          },
          verdictReason: 'Admissible. Government reports can count as strong evidence when the institution, data, and methods are transparent.',
          teachingPoint: 'Peer review is powerful, but well-documented government research can also be academically credible.'
        },
        {
          id: 'green-earth-brief',
          title: 'Why Nuclear Energy Is a Dangerous Distraction',
          author: 'Sarah Jenkins, Communications Director',
          publication: 'Green Earth Alliance Policy Brief',
          date: '2024',
          type: 'Advocacy Report',
          difficulty: 'Medium',
          skillFocus: 'Objectivity',
          excerpt:
            'Despite industry lies about safety, nuclear power remains a terrifying existential threat to humanity. We must abandon all nuclear projects immediately and redirect every dollar to wind and solar. Our organization will keep lobbying Congress until every reactor is shut down.',
          verdict: false,
          answers: {
            authority: false,
            currency: true,
            rigor: false,
            objectivity: false
          },
          clues: {
            authority: 'The author is a communications director, not a scientist or nuclear-policy researcher.',
            currency: 'It is current, but current advocacy still counts as advocacy.',
            rigor: 'There is no sign of peer review or a neutral institutional vetting process.',
            objectivity: 'The emotional diction and explicit lobbying goal make the agenda obvious.'
          },
          verdictReason: 'Dismissed. This is persuasion from an advocacy group, not neutral academic evidence.',
          teachingPoint: 'A strong opinion and a polished PDF do not turn advocacy into research.'
        },
        {
          id: 'vape-white-paper',
          title: 'Reframing Nicotine: A Youth Harm-Reduction Opportunity',
          author: 'Adrian Poe, Strategic Policy Fellow',
          publication: 'Vapor Freedom Coalition White Paper',
          date: '2025',
          type: 'Industry White Paper',
          difficulty: 'Medium',
          skillFocus: 'Rigor + Objectivity',
          excerpt:
            'Youth experimentation with vaping should be understood as a manageable pathway away from combustible tobacco. Our analysis of consumer behavior suggests that alarmist regulation may harm innovation. The coalition receives support from leading vapor-product manufacturers committed to choice.',
          verdict: false,
          answers: {
            authority: false,
            currency: true,
            rigor: false,
            objectivity: false
          },
          clues: {
            authority: 'A strategic policy fellow at an industry coalition is not the same as a neutral public-health researcher.',
            currency: 'The report is recent, but recency does not solve conflict of interest.',
            rigor: 'A coalition white paper is not peer-reviewed and does not describe a rigorous external vetting process.',
            objectivity: 'The source is funded by companies that benefit directly from the argument it is making.'
          },
          verdictReason: 'Dismissed. It is current, but the authority, rigor, and objectivity problems are fatal.',
          teachingPoint: 'Follow the money. Funding and purpose can completely change how trustworthy a source is.'
        }
      ]
    },
    {
      id: 'research-archive',
      name: 'Research Archive Docket',
      chapter: 'Chapter 3',
      promotion: 'Associate Judge Promotion',
      theme: 'Now the sources look more polished, which means the weak ones hide better.',
      overview: 'These cases introduce preprints, summary journalism, and stronger research comparisons.',
      cases: [
        {
          id: 'sleep-meta',
          title: 'School Start Time Delays and Adolescent Sleep Outcomes: A Systematic Review',
          author: 'Dr. Laila Moreno, M.D., M.P.H.',
          publication: 'JAMA Pediatrics',
          date: '2022',
          type: 'Systematic Review',
          difficulty: 'Medium',
          skillFocus: 'Rigor',
          excerpt:
            'Reviewing 23 studies from five countries, the authors found that later school start times were associated with longer sleep duration, lower tardiness, and improved student mood. Inclusion criteria, database search strategy, and study-quality ratings are fully reported.',
          verdict: true,
          answers: {
            authority: true,
            currency: true,
            rigor: true,
            objectivity: true
          },
          clues: {
            authority: 'The author is medically and methodologically qualified for adolescent-health research.',
            currency: 'A 2022 systematic review remains current for this education-health topic.',
            rigor: 'JAMA Pediatrics and a systematic-review design both signal strong vetting and synthesis.',
            objectivity: 'The excerpt focuses on method and evidence instead of hype.'
          },
          verdictReason: 'Admissible. This is current, expert, strongly vetted, and methodologically transparent.',
          teachingPoint: 'Systematic reviews are often stronger than single studies because they evaluate a whole field of evidence.'
        },
        {
          id: 'ai-preprint',
          title: 'AI Flashcard Bots Eliminate the Need for Human Teaching',
          author: 'Nora Fielding, M.S. Candidate',
          publication: 'OpenLearn Preprint Server',
          date: '2025',
          type: 'Preprint',
          difficulty: 'Hard',
          skillFocus: 'Rigor',
          excerpt:
            'In a pilot involving 18 volunteer students, our bot improved quiz performance after one week. Because traditional instruction is inefficient, schools should rapidly replace low-value classroom review with AI memorization systems. The manuscript has not yet undergone peer review.',
          verdict: false,
          answers: {
            authority: false,
            currency: true,
            rigor: false,
            objectivity: false
          },
          clues: {
            authority: 'The author is still a graduate student and makes sweeping policy claims beyond a tiny pilot study.',
            currency: 'The source is recent, but recency cannot compensate for weak vetting.',
            rigor: 'The excerpt openly states that the manuscript has not undergone peer review.',
            objectivity: 'The language jumps from a tiny pilot to a broad claim about replacing teachers.'
          },
          verdictReason: 'Dismissed. It is current, but the sample is tiny, the work is unreviewed, and the conclusions are overstated.',
          teachingPoint: 'Preprints can be useful leads, but they should not be treated like settled academic evidence without caution.'
        },
        {
          id: 'op-ed-smartphones',
          title: 'Why Schools Must Ban Phones Now',
          author: 'Caleb Hart',
          publication: 'The Metropolitan Ledger',
          date: '2024',
          type: 'Newspaper Opinion Column',
          difficulty: 'Hard',
          skillFocus: 'Authority + Objectivity',
          excerpt:
            'Anyone with eyes can see that phones are destroying attention, empathy, and probably civilization itself. One recent study proves the point, and schools that hesitate are choosing chaos. It is time for administrators to show backbone and ban the devices outright.',
          verdict: false,
          answers: {
            authority: false,
            currency: true,
            rigor: false,
            objectivity: false
          },
          clues: {
            authority: 'A columnist can comment on policy, but that does not make the column expert research evidence.',
            currency: 'The piece is current, but current opinion is still opinion.',
            rigor: 'The article references a study but is not itself a peer-reviewed or rigorously vetted research source.',
            objectivity: 'Loaded language like "destroying" and "choosing chaos" signals persuasion, not neutral analysis.'
          },
          verdictReason: 'Dismissed. A current opinion article may be interesting context, but it is not a credible academic source for the claim by itself.',
          teachingPoint: 'A source that quotes research is not automatically the best source to cite instead of the research itself.'
        }
      ]
    },
    {
      id: 'appeals-bench',
      name: 'Appeals Bench Docket',
      chapter: 'Chapter 4',
      promotion: 'Chief Justice Promotion',
      theme: 'Final docket. The sources look confident, and the weak ones are counting on you to blink first.',
      overview: 'Stronger institutional evidence appears beside polished but flawed alternatives.',
      cases: [
        {
          id: 'energy-press-release',
          title: 'CleanSweet Study Confirms Daily Sweetener Use Is Completely Harmless',
          author: 'Media Office',
          publication: 'NutriCore Holdings Press Center',
          date: '2025',
          type: 'Corporate Press Release',
          difficulty: 'Hard',
          skillFocus: 'Objectivity + Rigor',
          excerpt:
            'A groundbreaking company-sponsored study confirms that CleanSweet is completely harmless for all age groups. Consumers deserve freedom from fear-driven nutrition activists. Full results will appear soon, but early findings already prove the product is safer than critics claim.',
          verdict: false,
          answers: {
            authority: false,
            currency: true,
            rigor: false,
            objectivity: false
          },
          clues: {
            authority: 'The media office is speaking for the company, not as an independent expert research team.',
            currency: 'The date is current, but the underlying evidence is not actually available for review.',
            rigor: 'A promised future publication is not the same as present peer-reviewed evidence.',
            objectivity: 'The source is promotional, defensive, and financially interested in the claim.'
          },
          verdictReason: 'Dismissed. This is marketing language around unavailable evidence, not a citable academic source.',
          teachingPoint: 'If the evidence is only promised, promoted, or selectively summarized, the source has not earned academic trust yet.'
        },
        {
          id: 'academies-flooding',
          title: 'Resilient Coasts: Infrastructure Planning for Flood Risk',
          author: 'Committee on Coastal Resilience',
          publication: 'National Academies Press',
          date: '2024',
          type: 'Consensus Report',
          difficulty: 'Hard',
          skillFocus: 'Authority + Rigor',
          excerpt:
            'Drawing on climate science, engineering, and urban-planning research, the committee evaluates adaptive strategies for coastal communities under rising flood risk. The report synthesizes prior studies, identifies uncertainty ranges, and documents the review process used before release.',
          verdict: true,
          answers: {
            authority: true,
            currency: true,
            rigor: true,
            objectivity: true
          },
          clues: {
            authority: 'The National Academies assemble recognized experts to synthesize evidence on national problems.',
            currency: 'The 2024 release date is current for climate adaptation planning.',
            rigor: 'Consensus reports from the National Academies undergo formal review and methodological scrutiny.',
            objectivity: 'The excerpt is analytical, cautious, and transparent about uncertainty.'
          },
          verdictReason: 'Admissible. Consensus reports from highly reputable institutions can function as elite academic evidence when methods and review are documented.',
          teachingPoint: 'Institutional authority matters most when it is paired with transparent synthesis and review.'
        },
        {
          id: 'pediatrics-sleep',
          title: 'Nighttime Social Media Use and Adolescent Sleep Quality',
          author: 'Dr. Priya Shah, Ph.D.',
          publication: 'Pediatrics',
          date: '2024',
          type: 'Peer-Reviewed Academic Journal',
          difficulty: 'Hard',
          skillFocus: 'Whole-source judgment',
          excerpt:
            'Analyzing survey and device-tracking data from 2,300 students, the study found that higher nighttime social-media use predicted shorter sleep duration and lower self-reported alertness. The article details controls, effect sizes, and study limitations and discloses no external sponsor influence.',
          verdict: true,
          answers: {
            authority: true,
            currency: true,
            rigor: true,
            objectivity: true
          },
          clues: {
            authority: 'The author is a relevant expert working in adolescent behavior and health research.',
            currency: 'The publication date is recent for a fast-moving technology topic.',
            rigor: 'Pediatrics is a peer-reviewed journal, and the excerpt references controls and limitations.',
            objectivity: 'The source explains effects and limits instead of pushing a dramatic agenda.'
          },
          verdictReason: 'Admissible. It is expert, current, rigorously reviewed, and cautious enough to support serious academic work.',
          teachingPoint: 'The best research sources show their limits while still making evidence-based claims.'
        }
      ]
    }
  ];

  // Add more local custom-practice templates here if you want more AI fallback variety.
  const customTemplates = {
    credible: [
      {
        title: 'Systematic Review of {topic} Outcomes in Secondary Schools',
        author: 'Dr. Mina Alvarez, Ed.D.',
        publication: 'Journal of Applied Education Research',
        type: 'Peer-Reviewed Academic Journal',
        excerpt:
          'Reviewing 19 studies on {topic}, the authors compare outcomes across districts, report effect sizes, and discuss methodological limits. Funding and review procedures are disclosed in full.',
        answers: { authority: true, currency: true, rigor: true, objectivity: true },
        verdict: true
      },
      {
        title: '{topic} and Community Health: A National Assessment',
        author: 'Office of Public Data Strategy',
        publication: 'National Public Health Institute',
        type: 'Government Research Report',
        excerpt:
          'This report analyzes five years of data tied to {topic}, documents its methods, and explains the limits of correlation-based findings in a technical appendix.',
        answers: { authority: true, currency: true, rigor: true, objectivity: true },
        verdict: true
      }
    ],
    flawed: [
      {
        title: 'What They Will Not Tell You About {topic}',
        author: 'Rex Vale, Lifestyle Commentator',
        publication: 'TruthSignal Blog',
        type: 'Blog / Commentary',
        excerpt:
          'Experts keep hiding the truth about {topic}. Real people know better, and anyone who still trusts official reports is being played. Buy the full guide before critics force it offline.',
        answers: { authority: false, currency: true, rigor: false, objectivity: false },
        verdict: false
      },
      {
        title: '{topic} Solved: Industry Coalition Brief',
        author: 'Communications Desk',
        publication: 'Future Choice Alliance',
        type: 'Advocacy White Paper',
        excerpt:
          'Our coalition-sponsored analysis proves that critics of {topic} are using fear instead of facts. The brief summarizes internal findings but does not release the full dataset at this time.',
        answers: { authority: false, currency: true, rigor: false, objectivity: false },
        verdict: false
      }
    ],
    outdated: [
      {
        title: 'Early Internet Lessons for {topic}',
        author: 'Dr. Lionel Mercer',
        publication: 'Educational Trends Quarterly',
        type: 'Academic Journal',
        excerpt:
          'Drawing on a 2001 sample, the article describes how early web habits shaped student behavior around {topic}. The framework predates modern platforms and devices.',
        answers: { authority: true, currency: false, rigor: true, objectivity: true },
        verdict: false
      }
    ]
  };

  return {
    criteria: criteria,
    personas: personas,
    ranks: ranks,
    dockets: dockets,
    customTemplates: customTemplates
  };
})();
