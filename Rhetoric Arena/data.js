window.RA_DATA = (function () {
  const categories = ['Defensible Claim', 'Weak Claim', 'Evidence', 'Commentary'];

  const mechanics = {
    snap: {
      id: 'snap',
      name: 'Rhetorical Situation Snap',
      short: 'Snap',
      icon: 'RS',
      skill: 'Rhetorical situation',
      description: 'Read the room fast: speaker, audience, purpose, context, exigence.',
      howTo: 'Press 1-4 or click the sharpest read before the timer chews your combo.'
    },
    claimChaos: {
      id: 'claimChaos',
      name: 'Claim or Chaos',
      short: 'Claim',
      icon: 'CC',
      skill: 'Claims and evidence',
      description: 'Sort statements into claim, weak claim, evidence, or commentary.',
      howTo: 'Use 1-4 to toss the statement into the right lane.'
    },
    evidence: {
      id: 'evidence',
      name: 'Evidence Match',
      short: 'Match',
      icon: 'EM',
      skill: 'Evidence quality',
      description: 'Attach the strongest proof to the argument that needs it.',
      howTo: 'Pick the evidence that does the most real argumentative work.'
    },
    logic: {
      id: 'logic',
      name: 'Logic Chain',
      short: 'Chain',
      icon: 'LC',
      skill: 'Reasoning and organization',
      description: 'Build a line of reasoning in the strongest order.',
      howTo: 'Click the steps in the order you want them to land.'
    },
    style: {
      id: 'style',
      name: 'Style Surgery',
      short: 'Style',
      icon: 'SS',
      skill: 'Style',
      description: 'Repair weak sentences for precision, concision, and force.',
      howTo: 'Choose the revision that sharpens the sentence instead of decorating it.'
    },
    fallacy: {
      id: 'fallacy',
      name: 'Fallacy Smackdown',
      short: 'Smackdown',
      icon: 'FS',
      skill: 'Reasoning',
      description: 'Spot the bad logic and crack the argument cleanly.',
      howTo: 'Call the fallacy before the nonsense grows a shield.'
    },
    synthesis: {
      id: 'synthesis',
      name: 'Synthesis Sprint',
      short: 'Sprint',
      icon: 'SY',
      skill: 'Synthesis',
      description: 'Pick the strongest source set, then connect it with actual reasoning.',
      howTo: 'Select up to two source cards, then lock in the best commentary.'
    }
  };

  const titles = [
    { level: 1, title: 'Fresh Ink' },
    { level: 2, title: 'Audience Scout' },
    { level: 4, title: 'Claim Spark' },
    { level: 6, title: 'Evidence Hunter' },
    { level: 8, title: 'Logic Runner' },
    { level: 10, title: 'Style Surgeon' },
    { level: 12, title: 'Fallacy Breaker' },
    { level: 14, title: 'Source Tactician' },
    { level: 16, title: 'Arena Contender' },
    { level: 18, title: 'Rhetoric Champion' },
    { level: 20, title: 'AP Lang Legend' }
  ];

  const announcerLines = {
    opening: [
      'Dean Static on the mic. Read quickly, think clearly, and do not embarrass your future thesis.',
      'Coach Margot says momentum is a rhetorical device if you hit it hard enough.',
      'Ivy Voss is already warming up on the other side of the bracket. No pressure. Slight pressure.',
      'This arena rewards clean thinking and punishes panic-clicking. Choose your hobby.'
    ],
    strong: [
      'Clean hit. That choice actually moves the argument.',
      'Sharp read. You saw the rhetorical move before it finished landing.',
      'That is how you keep a combo alive and a reader convinced.',
      'Strong work. Fast and defensible is a beautiful combination.'
    ],
    weak: [
      'Relevant, but not lethal. Tighten the reasoning.',
      'You were in the neighborhood. The line of reasoning wanted more.',
      'Decent instinct, softer proof. Keep the streak from slipping.',
      'Almost there. AP readers like precision more than vibes.'
    ],
    flawed: [
      'That move had confidence, which is not the same as evidence.',
      'Rough swing. Reset the read and get back in the fight.',
      'That argument folded under one follow-up question.',
      'The crowd heard the click. The logic did not.'
    ],
    rankUp: [
      'Rank up. The arena notices patterns, and yours just improved.',
      'New title unlocked. Your rhetorical reputation is getting inconveniently real.',
      'Level jump. Someone in the cheap seats just started taking notes.',
      'You ranked up. Even Ivy looked annoyed, which counts as applause.'
    ],
    bossIntro: [
      'Boss gate opening. Keep your pulse, not just your speed.',
      'Boss round online. This one expects you to think in layers.',
      'Boss signal live. Five clean decisions beat fifteen frantic ones.',
      'Boss encounter. Bring audience awareness and a functioning line of reasoning.'
    ]
  };

  // Add more prompt items here. Each mechanic renderer reads these same shapes.
  const content = {
    snap: [
      {
        id: 'snap1',
        skill: 'Audience awareness',
        stem:
          'Freshmen, in the next week you will hear a hundred speeches about excellence. I am here to tell you where people actually get lost: missed deadlines, ignored emails, and the myth that you will magically organize yourself later.',
        question: 'Which audience is the speaker targeting most directly?',
        options: [
          {
            label: 'First-year students',
            quality: 'strong',
            feedback: 'Good read: the direct address to freshmen shapes the speaker\'s tone and purpose.'
          },
          {
            label: 'Parents worried about grades',
            quality: 'flawed',
            feedback: 'The passage is not aimed at parents. The second-person address points squarely at students.'
          },
          {
            label: 'Upperclassmen giving tours',
            quality: 'weak',
            feedback: 'Upperclassmen are part of the setting, but the rhetorical focus is still the incoming class.'
          },
          {
            label: 'Teachers assigning work',
            quality: 'flawed',
            feedback: 'Teachers matter to the situation, but they are not the intended audience of the speech.'
          }
        ]
      },
      {
        id: 'snap2',
        skill: 'Purpose',
        stem:
          'If the school installs phone pouches, class will not become magical overnight. It will, however, give teachers back the first ten minutes they currently spend begging for eye contact.',
        question: 'What is the speaker\'s main purpose?',
        options: [
          {
            label: 'To argue that phone pouches would improve classroom focus',
            quality: 'strong',
            feedback: 'Yes. The writer admits limits, then makes a practical claim about audience attention.'
          },
          {
            label: 'To praise teachers for their patience',
            quality: 'weak',
            feedback: 'Teachers are mentioned, but mainly to support a policy argument about focus.'
          },
          {
            label: 'To entertain readers with sarcasm',
            quality: 'weak',
            feedback: 'The sarcasm is a stylistic choice, not the central purpose.'
          },
          {
            label: 'To describe how phones changed over time',
            quality: 'flawed',
            feedback: 'Nothing in the passage traces historical change. The point is policy and classroom attention.'
          }
        ]
      },
      {
        id: 'snap3',
        skill: 'Exigence',
        stem:
          'Last night\'s transit collapse stranded hundreds of riders. I asked for your trust when I promised a smoother rollout, and today I am asking for your patience while we make the fixes public.',
        question: 'What exigence most likely prompted this statement?',
        options: [
          {
            label: 'A public transit failure triggered criticism and demanded a response',
            quality: 'strong',
            feedback: 'Exactly. The speaker responds to an immediate crisis and public frustration.'
          },
          {
            label: 'The mayor wants to celebrate a successful launch',
            quality: 'flawed',
            feedback: 'The tone is apologetic, not celebratory. The statement is reactive, not triumphant.'
          },
          {
            label: 'The city is opening a new museum exhibit',
            quality: 'flawed',
            feedback: 'That context does not fit the content or the urgency of the apology.'
          },
          {
            label: 'Voters are requesting more parking downtown',
            quality: 'weak',
            feedback: 'It is still the wrong issue. The statement is clearly anchored to transit failure.'
          }
        ]
      },
      {
        id: 'snap4',
        skill: 'Speaker role',
        stem:
          'We are missing one class period because too many adults keep missing the point. If heat warnings cancel practice, they should also cancel pretending climate policy can wait.',
        question: 'Who is the most likely speaker?',
        options: [
          {
            label: 'A student activist organizing a climate walkout',
            quality: 'strong',
            feedback: 'Right. The diction and direct action frame a student speaker trying to mobilize peers.'
          },
          {
            label: 'A meteorologist writing a weather report',
            quality: 'flawed',
            feedback: 'This is advocacy, not neutral reporting. The rhetorical choice is confrontational on purpose.'
          },
          {
            label: 'A school nurse sending health data',
            quality: 'weak',
            feedback: 'The health angle matters, but the line sounds like activist persuasion rather than institutional reporting.'
          },
          {
            label: 'A parent asking for fewer homework assignments',
            quality: 'flawed',
            feedback: 'The topic and audience cues point toward climate activism, not homework policy.'
          }
        ]
      },
      {
        id: 'snap5',
        skill: 'Audience and context',
        stem:
          'Members of the board: before you call this library renovation a luxury, walk through the room at lunch and count how many students use it as their only quiet place all day.',
        question: 'What context matters most for interpreting this statement?',
        options: [
          {
            label: 'A funding decision is being debated by school board members',
            quality: 'strong',
            feedback: 'Exactly. The writer is addressing decision-makers during a budget argument.'
          },
          {
            label: 'Students are voting for prom theme options',
            quality: 'flawed',
            feedback: 'Nothing about the language suggests a student social event. The appeal is budget-focused.'
          },
          {
            label: 'A teacher is grading silent reading logs',
            quality: 'flawed',
            feedback: 'The writer is lobbying the board, not discussing classroom routine.'
          },
          {
            label: 'A librarian is posting a casual social media update',
            quality: 'weak',
            feedback: 'A librarian may be involved, but the direct address shows a formal appeal in a decision-making context.'
          }
        ]
      },
      {
        id: 'snap6',
        skill: 'Purpose',
        stem:
          'Families, if you want students to read more, give them ten quiet minutes before the avalanche of questions about missing assignments, sports bags, and who forgot to unload the dishwasher.',
        question: 'What is the speaker trying to persuade the audience to do?',
        options: [
          {
            label: 'Create a home routine that makes reading more likely',
            quality: 'strong',
            feedback: 'Yes. The speaker uses concrete domestic detail to push a practical audience-focused habit.'
          },
          {
            label: 'Punish students who avoid homework',
            quality: 'flawed',
            feedback: 'The tone is advisory, not punitive. The emphasis is on environment, not punishment.'
          },
          {
            label: 'Stop students from joining activities',
            quality: 'flawed',
            feedback: 'Activities are mentioned as part of the chaos, not the target of the argument.'
          },
          {
            label: 'Complain that modern families are too busy',
            quality: 'weak',
            feedback: 'There is mild frustration, but the main purpose is still a practical recommendation.'
          }
        ]
      },
      {
        id: 'snap7',
        skill: 'Context',
        stem:
          'You are standing in front of a lunch counter that served white customers in 1960 but became a site of student protest by noon. The object matters because ordinary places can suddenly become political stages.',
        question: 'What is the most likely rhetorical purpose of this museum placard?',
        options: [
          {
            label: 'To frame the object within the civil rights movement and its significance',
            quality: 'strong',
            feedback: 'Strong. The placard gives context so the audience sees the object as historical evidence, not furniture.'
          },
          {
            label: 'To advertise the museum gift shop',
            quality: 'flawed',
            feedback: 'Nothing in the diction suggests sales language. The passage is interpretive and historical.'
          },
          {
            label: 'To attack modern student activism',
            quality: 'flawed',
            feedback: 'The text values protest as historically significant rather than dismissing it.'
          },
          {
            label: 'To prove restaurants should ban protests',
            quality: 'weak',
            feedback: 'The passage is explanatory, not a policy argument about protests.'
          }
        ]
      },
      {
        id: 'snap8',
        skill: 'Audience and purpose',
        stem:
          'I am not promising better vending machine snacks. I am promising meeting notes you can actually read and a council that answers messages before the semester ends.',
        question: 'What is the speaker\'s purpose in this campaign line?',
        options: [
          {
            label: 'To persuade students that practical responsiveness matters more than flashy promises',
            quality: 'strong',
            feedback: 'Exactly. The contrast builds ethos by rejecting shallow campaign talk.'
          },
          {
            label: 'To criticize students for liking snacks',
            quality: 'flawed',
            feedback: 'The snack reference is a contrast move, not a complaint about student taste.'
          },
          {
            label: 'To explain how meeting notes are written',
            quality: 'flawed',
            feedback: 'The line is persuasive, not procedural.'
          },
          {
            label: 'To entertain parents at back-to-school night',
            quality: 'weak',
            feedback: 'The sentence could entertain, but the intended audience is likely fellow students in an election.'
          }
        ]
      }
    ],
    claimChaos: [
      {
        id: 'claim1',
        statement: 'Schools should start later because teen sleep loss harms attention, mood, and driving safety.',
        answer: 'Defensible Claim',
        skill: 'Claim',
        explanation: 'This is arguable, specific enough to defend, and built to support with evidence.'
      },
      {
        id: 'claim2',
        statement: 'School lunch is bad and should be better.',
        answer: 'Weak Claim',
        skill: 'Claim',
        explanation: 'It has an opinion, but it is too vague to drive a strong line of reasoning.'
      },
      {
        id: 'claim3',
        statement: 'In a district survey, 62% of students said they skipped breakfast when first period started before 8 a.m.',
        answer: 'Evidence',
        skill: 'Evidence',
        explanation: 'This is concrete support. It offers data, not the writer\'s central argument.'
      },
      {
        id: 'claim4',
        statement: 'That number matters because it links school schedules to student well-being instead of mere convenience.',
        answer: 'Commentary',
        skill: 'Commentary',
        explanation: 'This explains why the evidence matters. It interprets rather than proves by itself.'
      },
      {
        id: 'claim5',
        statement: 'Social media ruins everything.',
        answer: 'Weak Claim',
        skill: 'Claim',
        explanation: 'It is broad, absolute, and too sloppy to support with precise evidence.'
      },
      {
        id: 'claim6',
        statement: 'Public libraries should eliminate overdue fines because fines block access more than they teach responsibility.',
        answer: 'Defensible Claim',
        skill: 'Claim',
        explanation: 'This is a defendable position that invites evidence and commentary.'
      },
      {
        id: 'claim7',
        statement: 'When Chicago libraries removed late fees, thousands of previously blocked accounts became usable again.',
        answer: 'Evidence',
        skill: 'Evidence',
        explanation: 'This supplies specific support for an argument about access.'
      },
      {
        id: 'claim8',
        statement: 'By redefining fines as an access barrier, the writer shifts the debate from punishment to public mission.',
        answer: 'Commentary',
        skill: 'Commentary',
        explanation: 'This analyzes the rhetorical choice and explains what the claim is doing.'
      }
    ],
    evidence: [
      {
        id: 'evidence1',
        claim: 'City buses should be free for students.',
        options: [
          {
            label: 'A district report found that 28% of student absences in one month were tied to transportation problems.',
            rating: 2,
            quality: 'strong',
            feedback: 'Best support: it directly connects transportation access to a concrete outcome.'
          },
          {
            label: 'Some students say buses feel crowded after school.',
            rating: 1,
            quality: 'weak',
            feedback: 'Relevant, but crowding does not fully prove that free fares would solve the core problem.'
          },
          {
            label: 'Most city buses are painted blue and silver.',
            rating: 0,
            quality: 'flawed',
            feedback: 'That fact is descriptive only. It does not support the argument at all.'
          }
        ]
      },
      {
        id: 'evidence2',
        claim: 'All ninth graders should take a media literacy unit.',
        options: [
          {
            label: 'A Stanford study found many students struggled to distinguish verified reporting from sponsored content online.',
            rating: 2,
            quality: 'strong',
            feedback: 'Strong support. It proves a real need for the course.'
          },
          {
            label: 'Teachers say students spend a lot of time on their phones.',
            rating: 1,
            quality: 'weak',
            feedback: 'It is relevant, but it does not directly show why media literacy instruction would help.'
          },
          {
            label: 'Ninth graders usually like group activities.',
            rating: 0,
            quality: 'flawed',
            feedback: 'Student preference is not evidence that the course is necessary.'
          }
        ]
      },
      {
        id: 'evidence3',
        claim: 'The cafeteria should add shaded outdoor seating.',
        options: [
          {
            label: 'The school nurse recorded a spike in heat-related visits during outdoor lunch periods in August and September.',
            rating: 2,
            quality: 'strong',
            feedback: 'Good choice: it ties the proposal to student comfort and health with concrete evidence.'
          },
          {
            label: 'Many students say they like being outside when the weather is nice.',
            rating: 1,
            quality: 'weak',
            feedback: 'Relevant, but this supports preference more than the need for shade.'
          },
          {
            label: 'The existing outdoor tables are rectangular.',
            rating: 0,
            quality: 'flawed',
            feedback: 'Shape is irrelevant to the claim about shade and usability.'
          }
        ]
      },
      {
        id: 'evidence4',
        claim: 'The school newspaper deserves a larger reporting budget.',
        options: [
          {
            label: 'Last semester the paper broke a facilities story that led to repaired classroom heating within one week.',
            rating: 2,
            quality: 'strong',
            feedback: 'Strong support: it shows the paper has civic impact worth funding.'
          },
          {
            label: 'The editor-in-chief really enjoys covering sports.',
            rating: 0,
            quality: 'flawed',
            feedback: 'Personal enthusiasm is not proof that more budget is warranted.'
          },
          {
            label: 'The staff often runs out of photo and printing funds before feature season ends.',
            rating: 1,
            quality: 'weak',
            feedback: 'Useful, but it shows a funding problem more than the paper\'s value.'
          }
        ]
      },
      {
        id: 'evidence5',
        claim: 'A community service requirement can strengthen civic engagement.',
        options: [
          {
            label: 'A longitudinal study found teens who completed structured service programs were more likely to vote and volunteer later.',
            rating: 2,
            quality: 'strong',
            feedback: 'Exactly. This evidence connects service to long-term civic behavior.'
          },
          {
            label: 'Some students say volunteering looks good on college applications.',
            rating: 1,
            quality: 'weak',
            feedback: 'It is relevant motivation, but it does not prove deeper civic engagement.'
          },
          {
            label: 'Service shirts are usually comfortable and easy to wear.',
            rating: 0,
            quality: 'flawed',
            feedback: 'Comfortable shirts are not evidence for the claim.'
          }
        ]
      },
      {
        id: 'evidence6',
        claim: 'A later school start would improve learning.',
        options: [
          {
            label: 'After one district shifted its start time by forty minutes, attendance rose and first-period failures dropped.',
            rating: 2,
            quality: 'strong',
            feedback: 'Best support: it links later starts to measurable academic outcomes.'
          },
          {
            label: 'Students often say first period feels too early.',
            rating: 1,
            quality: 'weak',
            feedback: 'Relevant, but student opinion is weaker than outcome-based evidence.'
          },
          {
            label: 'Many alarm clocks are sold in bright colors.',
            rating: 0,
            quality: 'flawed',
            feedback: 'That fact has nothing to do with learning or schedules.'
          }
        ]
      },
      {
        id: 'evidence7',
        claim: 'The campus should ban single-use plastic bottles at events.',
        options: [
          {
            label: 'A waste audit after two home games found more than 1,400 plastic bottles in stadium trash alone.',
            rating: 2,
            quality: 'strong',
            feedback: 'Strong evidence. It quantifies the scale of the problem the policy would address.'
          },
          {
            label: 'Many students already own reusable bottles.',
            rating: 1,
            quality: 'weak',
            feedback: 'Helpful, but it is more a feasibility point than proof of need.'
          },
          {
            label: 'Plastic bottles are often clear.',
            rating: 0,
            quality: 'flawed',
            feedback: 'Bottle color does no argumentative work here.'
          }
        ]
      },
      {
        id: 'evidence8',
        claim: 'The district should fund live translation at school meetings.',
        options: [
          {
            label: 'When one middle school added live translation, family turnout at meetings nearly doubled within a semester.',
            rating: 2,
            quality: 'strong',
            feedback: 'Great support. It shows a direct improvement in access and participation.'
          },
          {
            label: 'Families appreciate clear communication from schools.',
            rating: 1,
            quality: 'weak',
            feedback: 'True, but too general to prove the specific impact of translation.'
          },
          {
            label: 'The school mascot speaks only English.',
            rating: 0,
            quality: 'flawed',
            feedback: 'That detail is irrelevant to the claim.'
          }
        ]
      }
    ],
    logic: [
      {
        id: 'logic1',
        thesis: 'The school should convert part of an unused courtyard into a community garden.',
        steps: [
          'Show that the courtyard is currently underused space with little academic value.',
          'Cite examples of gardens improving science engagement and student ownership.',
          'Address the concern that a garden would become one more neglected project.',
          'Conclude by proposing a low-cost pilot run by existing clubs and classes.'
        ]
      },
      {
        id: 'logic2',
        thesis: 'A block schedule could improve the quality of class discussion.',
        steps: [
          'Explain that rushed forty-minute periods often cut off deeper discussion.',
          'Use classroom evidence showing longer periods give students more time to process and respond.',
          'Acknowledge that long blocks can drag without good planning.',
          'Argue that teacher support and structure make the schedule change worth testing.'
        ]
      },
      {
        id: 'logic3',
        thesis: 'The local paper should include more student voices in its opinion section.',
        steps: [
          'Establish that the paper claims to represent the wider community.',
          'Show that students are directly affected by city decisions on transit, safety, and parks.',
          'Respond to the objection that teenagers lack expertise.',
          'End by arguing that representation and lived experience strengthen civic coverage.'
        ]
      },
      {
        id: 'logic4',
        thesis: 'The school dress code should be revised for clarity and fairness.',
        steps: [
          'Point out that vague language leads to uneven enforcement.',
          'Use specific examples of students receiving conflicting messages from staff.',
          'Address the concern that any revision would weaken standards.',
          'Propose clearer wording that keeps expectations while reducing arbitrary punishment.'
        ]
      },
      {
        id: 'logic5',
        thesis: 'An advisory period would strengthen belonging for new students.',
        steps: [
          'Define the problem: many students enter school without a consistent adult contact.',
          'Use survey evidence linking belonging to attendance and academic persistence.',
          'Confront the worry that advisory wastes instructional time.',
          'Argue that a short, structured advisory creates support without gutting academics.'
        ]
      },
      {
        id: 'logic6',
        thesis: 'A limited open-campus lunch policy could work for upperclassmen.',
        steps: [
          'State why students want the policy and how the current lunch setup creates congestion.',
          'Offer evidence from nearby schools that use permission-based open lunch systems.',
          'Answer safety and equity concerns directly.',
          'Recommend a pilot restricted to seniors with attendance and grade requirements.'
        ]
      },
      {
        id: 'logic7',
        thesis: 'The city should invest in neighborhood Wi-Fi access points.',
        steps: [
          'Frame internet access as a public need rather than a luxury.',
          'Provide evidence that unreliable access blocks homework, job applications, and city services.',
          'Address objections about cost and maintenance.',
          'Finish with a targeted rollout plan for the highest-need areas.'
        ]
      },
      {
        id: 'logic8',
        thesis: 'The school should keep an arts requirement for graduation.',
        steps: [
          'Begin by stating that graduation requirements signal what a school values.',
          'Use evidence that arts courses strengthen creative risk-taking and engagement.',
          'Acknowledge concerns about already packed student schedules.',
          'Close by defending the requirement as part of a balanced education.'
        ]
      }
    ],
    style: [
      {
        id: 'style1',
        weak: 'The principal was kind of mad about the hallway situation and said students should maybe stop doing it.',
        goal: 'Revise for precision and authority.',
        options: [
          {
            label: 'The principal condemned the hallway chaos and ordered students to clear the space immediately.',
            quality: 'strong',
            feedback: 'Stronger diction and precise action make the sentence clearer and more persuasive.'
          },
          {
            label: 'The principal was, like, pretty upset about the hallway thing and wanted change.',
            quality: 'flawed',
            feedback: 'This revision adds vagueness instead of authority.'
          },
          {
            label: 'The principal did not love the hallway scene and had thoughts about it.',
            quality: 'weak',
            feedback: 'There is some movement, but the phrasing is still too loose to carry force.'
          }
        ]
      },
      {
        id: 'style2',
        weak: 'Climate policy is important because the weather keeps being weird and people notice.',
        goal: 'Revise for concision and force.',
        options: [
          {
            label: 'Climate policy matters because increasingly extreme weather makes the crisis impossible to ignore.',
            quality: 'strong',
            feedback: 'Good revision: concise, specific, and rhetorically sharper.'
          },
          {
            label: 'Climate policy is really, really important because the weather has been extremely weird lately.',
            quality: 'weak',
            feedback: 'It is more emphatic, but still vague and repetitive.'
          },
          {
            label: 'The weather exists, and policy should probably react somehow at some point.',
            quality: 'flawed',
            feedback: 'This loses seriousness and precision at the same time.'
          }
        ]
      },
      {
        id: 'style3',
        weak: 'Homework is bad for students, and that is one reason schools should maybe rethink it.',
        goal: 'Revise for sharper commentary.',
        options: [
          {
            label: 'Excessive homework deserves scrutiny because it can drain time without deepening learning.',
            quality: 'strong',
            feedback: 'That revision sounds arguable and purposeful instead of flatly negative.'
          },
          {
            label: 'Homework is not awesome, which is honestly the whole issue.',
            quality: 'flawed',
            feedback: 'The casual diction weakens the writer\'s credibility and clarity.'
          },
          {
            label: 'Homework can be bad, and schools might want to think about the situation.',
            quality: 'weak',
            feedback: 'Softer and safer, but still not precise enough to drive argument.'
          }
        ]
      },
      {
        id: 'style4',
        weak: 'The recycling bins are not used a lot, so something should probably be done about them.',
        goal: 'Revise for emphasis and specificity.',
        options: [
          {
            label: 'Unused recycling bins reveal a participation problem, not a hardware problem, and the school should respond accordingly.',
            quality: 'strong',
            feedback: 'Strong revision. It reframes the issue with precision and sharper emphasis.'
          },
          {
            label: 'The recycling bins are definitely there and people are not really doing enough.',
            quality: 'weak',
            feedback: 'The sentence gestures toward urgency but stays vague.'
          },
          {
            label: 'Recycling bins exist in a mysterious state of low usage that is bad.',
            quality: 'flawed',
            feedback: 'The language is foggy and undercuts rhetorical control.'
          }
        ]
      },
      {
        id: 'style5',
        weak: 'Open campus lunch sounds nice, but there are also some concerns, so the issue is complicated.',
        goal: 'Revise for nuance without losing momentum.',
        options: [
          {
            label: 'Open campus lunch appeals to students, but any serious proposal has to answer safety and access concerns directly.',
            quality: 'strong',
            feedback: 'This keeps nuance while making the sentence purposeful and argument-ready.'
          },
          {
            label: 'Open campus lunch is cool, except maybe not, depending on the concerns.',
            quality: 'flawed',
            feedback: 'The revision loses control and sounds indecisive rather than nuanced.'
          },
          {
            label: 'Open campus lunch has good parts and bad parts, which makes it a topic worth discussing.',
            quality: 'weak',
            feedback: 'It is balanced, but still too generic to feel analytical.'
          }
        ]
      },
      {
        id: 'style6',
        weak: 'Banning books is bad because it stops people from reading things.',
        goal: 'Revise for stronger diction and complexity.',
        options: [
          {
            label: 'Book bans narrow intellectual access by removing complex texts from public debate.',
            quality: 'strong',
            feedback: 'Yes. The diction is more precise, and the claim carries real analytical weight.'
          },
          {
            label: 'Banning books is super bad because reading matters a lot.',
            quality: 'weak',
            feedback: 'The position is clear, but the language is still broad and thin.'
          },
          {
            label: 'Book bans are not ideal and probably do some reading-related stuff.',
            quality: 'flawed',
            feedback: 'This drains force and precision from the sentence.'
          }
        ]
      },
      {
        id: 'style7',
        weak: 'The student paper needs more money because it could do more things with it.',
        goal: 'Revise for concision and argumentative force.',
        options: [
          {
            label: 'The student paper needs more funding because stronger reporting requires time, travel, and production support.',
            quality: 'strong',
            feedback: 'Clean and persuasive. It names the resources that connect money to impact.'
          },
          {
            label: 'The student paper needs more money because extra money would be useful.',
            quality: 'flawed',
            feedback: 'This repeats the idea without adding precision or reasoning.'
          },
          {
            label: 'The student paper could do many impressive, relevant things with additional financial help.',
            quality: 'weak',
            feedback: 'Somewhat stronger, but still fuzzy about what the funds actually support.'
          }
        ]
      },
      {
        id: 'style8',
        weak: 'Volunteering can change people in ways that are good and useful for communities.',
        goal: 'Revise for rhetorical effect and precision.',
        options: [
          {
            label: 'Structured volunteering can turn civic responsibility from an abstract value into a practiced habit.',
            quality: 'strong',
            feedback: 'Strong revision. It is precise, memorable, and conceptually tighter.'
          },
          {
            label: 'Volunteering is good because communities need good things from people.',
            quality: 'flawed',
            feedback: 'This revision is circular and vague.'
          },
          {
            label: 'Volunteering can have positive effects that communities may find beneficial over time.',
            quality: 'weak',
            feedback: 'Clearer than the original, but still generic and low-impact.'
          }
        ]
      }
    ],
    fallacy: [
      {
        id: 'fallacy1',
        enemy: 'Captain Bandwagon',
        argument: 'Everyone on TikTok says the novel unit is pointless, so the book clearly has no value.',
        options: [
          {
            label: 'Appeal to popularity',
            quality: 'strong',
            feedback: 'Correct. Popular approval is not evidence that the claim is true.'
          },
          {
            label: 'Circular reasoning',
            quality: 'flawed',
            feedback: 'The argument is not repeating itself as proof. It is relying on popularity.'
          },
          {
            label: 'Post hoc reasoning',
            quality: 'flawed',
            feedback: 'There is no cause-and-effect timeline here. The issue is crowd opinion as proof.'
          },
          {
            label: 'Hasty generalization',
            quality: 'weak',
            feedback: 'It is sloppy, but the most accurate label is appeal to popularity.'
          }
        ]
      },
      {
        id: 'fallacy2',
        enemy: 'Duke Either-Or',
        argument: 'Either we ban phones completely, or nobody will learn anything ever again.',
        options: [
          {
            label: 'False dilemma',
            quality: 'strong',
            feedback: 'Exactly. The argument pretends there are only two extreme choices.'
          },
          {
            label: 'Ad hominem',
            quality: 'flawed',
            feedback: 'No person is being attacked. The problem is the fake two-option framing.'
          },
          {
            label: 'Straw man',
            quality: 'weak',
            feedback: 'It is distorted, but the sharper label is false dilemma.'
          },
          {
            label: 'Appeal to authority',
            quality: 'flawed',
            feedback: 'No authority figure is doing the argumentative work here.'
          }
        ]
      },
      {
        id: 'fallacy3',
        enemy: 'General Max Sample',
        argument: 'One volunteer skipped her shift, so service requirements obviously teach nothing.',
        options: [
          {
            label: 'Hasty generalization',
            quality: 'strong',
            feedback: 'Right hit. One example cannot support such a broad conclusion.'
          },
          {
            label: 'Circular reasoning',
            quality: 'flawed',
            feedback: 'The problem is weak sample size, not self-referential logic.'
          },
          {
            label: 'Slippery slope',
            quality: 'flawed',
            feedback: 'The argument is not predicting a chain reaction. It is overgeneralizing from one case.'
          },
          {
            label: 'Post hoc reasoning',
            quality: 'weak',
            feedback: 'There is an event and a conclusion, but the main flaw is the overgeneralized leap.'
          }
        ]
      },
      {
        id: 'fallacy4',
        enemy: 'Lady Cheap Shot',
        argument: 'Do not trust Maya\'s proposal for healthier lunches. She forgot spirit day last month.',
        options: [
          {
            label: 'Ad hominem',
            quality: 'strong',
            feedback: 'Correct. The speaker attacks Maya instead of addressing the proposal itself.'
          },
          {
            label: 'False cause',
            quality: 'flawed',
            feedback: 'There is no causal claim here. The move is a personal attack.'
          },
          {
            label: 'Appeal to popularity',
            quality: 'flawed',
            feedback: 'No crowd approval is involved. The claim dismisses the person.'
          },
          {
            label: 'Straw man',
            quality: 'weak',
            feedback: 'The proposal is not being misrepresented so much as the proposer is being attacked.'
          }
        ]
      },
      {
        id: 'fallacy5',
        enemy: 'Domino Dan',
        argument: 'If teachers allow one retake, soon nobody will study, grades will mean nothing, and school will collapse into chaos.',
        options: [
          {
            label: 'Slippery slope',
            quality: 'strong',
            feedback: 'Exactly. The claim leaps from one policy to an exaggerated disaster chain.'
          },
          {
            label: 'Bandwagon',
            quality: 'flawed',
            feedback: 'No popular opinion is doing the work here.'
          },
          {
            label: 'Hasty generalization',
            quality: 'weak',
            feedback: 'The argument is exaggerated, but the chain-reaction logic makes slippery slope the best label.'
          },
          {
            label: 'Circular reasoning',
            quality: 'flawed',
            feedback: 'It is not proving itself with itself. It is forecasting catastrophe without proof.'
          }
        ]
      },
      {
        id: 'fallacy6',
        enemy: 'Post Hoc Phoenix',
        argument: 'Attendance improved after the school installed water refill stations, so the refill stations must have caused the improvement.',
        options: [
          {
            label: 'Post hoc reasoning',
            quality: 'strong',
            feedback: 'Good catch. Sequence alone does not prove causation.'
          },
          {
            label: 'Ad hominem',
            quality: 'flawed',
            feedback: 'Nobody is being attacked. The issue is false cause.'
          },
          {
            label: 'Appeal to emotion',
            quality: 'flawed',
            feedback: 'The argument is causal, not emotional.'
          },
          {
            label: 'Hasty generalization',
            quality: 'weak',
            feedback: 'The inference is thin, but the precise problem is post hoc causation.'
          }
        ]
      },
      {
        id: 'fallacy7',
        enemy: 'Loop Mage',
        argument: 'The dress code is fair because the rules are fair and should be followed.',
        options: [
          {
            label: 'Circular reasoning',
            quality: 'strong',
            feedback: 'Yes. The claim uses its own conclusion as support.'
          },
          {
            label: 'Straw man',
            quality: 'flawed',
            feedback: 'No opposing claim is being distorted. The logic is circular.'
          },
          {
            label: 'Slippery slope',
            quality: 'flawed',
            feedback: 'There is no forecasted chain of consequences here.'
          },
          {
            label: 'Appeal to authority',
            quality: 'weak',
            feedback: 'Authority and obedience are hinted at, but the key flaw is the circular proof.'
          }
        ]
      },
      {
        id: 'fallacy8',
        enemy: 'Straw Titan',
        argument: 'Students who want a serious conversation about school lunches obviously think math classes do not matter.',
        options: [
          {
            label: 'Straw man',
            quality: 'strong',
            feedback: 'Exactly. The argument twists a narrower claim into an easier target.'
          },
          {
            label: 'Appeal to popularity',
            quality: 'flawed',
            feedback: 'No popularity claim is doing the work here.'
          },
          {
            label: 'Post hoc reasoning',
            quality: 'flawed',
            feedback: 'There is no timeline-based causation in this argument.'
          },
          {
            label: 'False dilemma',
            quality: 'weak',
            feedback: 'The wording is reductive, but the sharpest label is straw man because it misrepresents the original position.'
          }
        ]
      }
    ],
    synthesis: [
      {
        id: 'synth1',
        position: 'The city should convert one downtown parking lot into a shaded public plaza.',
        sources: [
          {
            id: 'A',
            label: 'Urban Heat Study',
            snippet: 'Blocks with dense tree cover averaged six degrees cooler in summer afternoons.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Restaurant Owner Interview',
            snippet: 'Some business owners worry customers will struggle to find evening parking.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Neighbor Memory Essay',
            snippet: 'A resident remembers the lot as a place to meet friends after games in the 1990s.',
            fit: 0
          },
          {
            id: 'D',
            label: 'Case Study from Phoenix',
            snippet: 'A small shaded plaza increased nearby foot traffic and weekend market attendance.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A to prove the plaza would improve daily comfort, then Source D to show that public space can also help nearby businesses.',
            quality: 'strong',
            feedback: 'Strong synthesis. You connected environmental and economic support into one line of reasoning.'
          },
          {
            label: 'Use Source B because concern makes the issue complicated, then mention Source C for local atmosphere.',
            quality: 'flawed',
            feedback: 'Those sources do not strongly support the position. They weaken it or drift away from the claim.'
          },
          {
            label: 'Use Source A for the heat problem, then mention Source B as a counterpoint the writer would need to address.',
            quality: 'weak',
            feedback: 'That works, but it is less powerful than pairing two strong supporting sources.'
          }
        ]
      },
      {
        id: 'synth2',
        position: 'The district should move high school start times later.',
        sources: [
          {
            id: 'A',
            label: 'Sleep Research Review',
            snippet: 'Teens naturally fall asleep later, making very early wake times especially costly.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Bus Routing Memo',
            snippet: 'Transportation staff warn that route changes would require planning and added costs.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Student Blog',
            snippet: 'One student says mornings feel illegal before sunrise.',
            fit: 0
          },
          {
            id: 'D',
            label: 'District Outcome Report',
            snippet: 'After a later bell time, one district saw fewer tardies and fewer first-period failures.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Pair Source A and Source D to show both the biological reason later starts help and the academic outcomes that follow.',
            quality: 'strong',
            feedback: 'Exactly. This creates a clear cause-and-result line of reasoning.'
          },
          {
            label: 'Use Source B because budget concerns always make an argument stronger.',
            quality: 'flawed',
            feedback: 'Budget concerns matter, but they do not support the claim by themselves.'
          },
          {
            label: 'Use Source A, then acknowledge Source B as a logistical challenge the argument should answer.',
            quality: 'weak',
            feedback: 'Useful, but pairing both strongest supporting sources would be more persuasive.'
          }
        ]
      },
      {
        id: 'synth3',
        position: 'All ninth graders should complete a media literacy unit.',
        sources: [
          {
            id: 'A',
            label: 'Stanford Civic Online Reasoning Study',
            snippet: 'Many students struggled to distinguish sponsored content from reported journalism.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Teacher Planning Note',
            snippet: 'Some teachers worry another required unit would tighten the pacing calendar.',
            fit: 1
          },
          {
            id: 'C',
            label: 'App Update Article',
            snippet: 'A social platform changed its color palette and menu layout this spring.',
            fit: 0
          },
          {
            id: 'D',
            label: 'University Survey',
            snippet: 'Students who received direct source-evaluation instruction were better at identifying misleading claims.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A to establish the problem and Source D to show that instruction can improve source evaluation.',
            quality: 'strong',
            feedback: 'Strong synthesis. You are connecting need and solution, not stacking random facts.'
          },
          {
            label: 'Use Source C because changes in app design prove students need more classes.',
            quality: 'flawed',
            feedback: 'That source does not do argumentative work for the position.'
          },
          {
            label: 'Use Source A for urgency and Source B to acknowledge implementation concerns.',
            quality: 'weak',
            feedback: 'Fair move, but one strong support plus one concern is less convincing than a strong support pair.'
          }
        ]
      },
      {
        id: 'synth4',
        position: 'The school library should stay open two hours later after classes.',
        sources: [
          {
            id: 'A',
            label: 'Check-In Data',
            snippet: 'Library use spikes immediately after school, then collapses when the space closes at 3:30.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Security Cost Estimate',
            snippet: 'Keeping the library open later would require extra staffing money.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Librarian Memoir Excerpt',
            snippet: 'A writer recalls falling in love with libraries as a child.',
            fit: 0
          },
          {
            id: 'D',
            label: 'Tutoring Program Report',
            snippet: 'Schools with later library hours saw higher participation in peer tutoring sessions.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A to show unmet demand and Source D to show later hours improve academic support opportunities.',
            quality: 'strong',
            feedback: 'Yes. That pairing supports both need and impact.'
          },
          {
            label: 'Use Source C because readers enjoy emotional memories about books.',
            quality: 'flawed',
            feedback: 'Emotion alone is not enough here. The claim needs evidence of access and impact.'
          },
          {
            label: 'Use Source A, then mention Source B to show the plan has tradeoffs a writer must address.',
            quality: 'weak',
            feedback: 'Reasonable, but less forceful than using both strongest supporting sources.'
          }
        ]
      },
      {
        id: 'synth5',
        position: 'School events should stop selling single-use plastic bottles.',
        sources: [
          {
            id: 'A',
            label: 'Waste Audit',
            snippet: 'One playoff weekend generated more than 1,400 discarded plastic bottles.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Athletic Trainer Note',
            snippet: 'Hydration access must remain easy during long outdoor events.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Color Marketing Article',
            snippet: 'Bright labels increase beverage sales in some stores.',
            fit: 0
          },
          {
            id: 'D',
            label: 'Stadium Refill Case Study',
            snippet: 'Schools that added refill stations reduced bottle waste without reducing concession revenue.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A to prove the waste problem exists and Source D to show a realistic alternative can work.',
            quality: 'strong',
            feedback: 'Strong reasoning. Problem plus practical solution makes the position persuasive.'
          },
          {
            label: 'Use Source B alone because hydration is the real issue.',
            quality: 'flawed',
            feedback: 'That source introduces a concern, not support for banning bottles.'
          },
          {
            label: 'Use Source A, then acknowledge Source B as a condition the policy must answer.',
            quality: 'weak',
            feedback: 'Not bad, but the strongest version still pairs two supporting sources.'
          }
        ]
      },
      {
        id: 'synth6',
        position: 'The district should fund live translation at school meetings.',
        sources: [
          {
            id: 'A',
            label: 'Family Participation Report',
            snippet: 'At one school, meeting attendance nearly doubled after live translation was added.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Parent Interview',
            snippet: 'One parent says she often attends but still feels nervous about speaking.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Mascot History Timeline',
            snippet: 'The school mascot has changed costumes three times since 1988.',
            fit: 0
          },
          {
            id: 'D',
            label: 'Civic Inclusion Study',
            snippet: 'Translation access increases trust and participation in public institutions.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A for the local turnout result and Source D to explain why language access matters for institutional trust.',
            quality: 'strong',
            feedback: 'Exactly. You are building from local proof to broader civic reasoning.'
          },
          {
            label: 'Use Source C because history creates school pride, which supports all district spending.',
            quality: 'flawed',
            feedback: 'That source does not connect to the claim about translation access.'
          },
          {
            label: 'Use Source A, then include Source B to humanize the participation barrier.',
            quality: 'weak',
            feedback: 'That is workable, but Source D would strengthen the reasoning more directly.'
          }
        ]
      },
      {
        id: 'synth7',
        position: 'The school should add a short advisory period for all students.',
        sources: [
          {
            id: 'A',
            label: 'Belonging Survey',
            snippet: 'Students who report a trusted adult at school are more likely to attend consistently.',
            fit: 2
          },
          {
            id: 'B',
            label: 'One Student Quote',
            snippet: 'A sophomore says she would like more time to ask questions during the week.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Parking Diagram',
            snippet: 'The staff lot fills up most quickly on rainy days.',
            fit: 0
          },
          {
            id: 'D',
            label: 'Program Evaluation',
            snippet: 'Schools with structured advisory periods saw fewer discipline referrals among ninth graders.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A to show why belonging matters and Source D to show advisory can improve student behavior and support.',
            quality: 'strong',
            feedback: 'Strong synthesis. The sources work together instead of sitting side by side.'
          },
          {
            label: 'Use Source C because logistics always make policies stronger.',
            quality: 'flawed',
            feedback: 'That source is irrelevant to the claim.'
          },
          {
            label: 'Use Source A, then add Source B for a personal angle.',
            quality: 'weak',
            feedback: 'That gives evidence plus anecdote, but the policy case is stronger with two robust support sources.'
          }
        ]
      },
      {
        id: 'synth8',
        position: 'The city should fund a student journalism lab at the public library.',
        sources: [
          {
            id: 'A',
            label: 'Youth Media Survey',
            snippet: 'Students reported wanting more chances to publish on local issues that affect them directly.',
            fit: 2
          },
          {
            id: 'B',
            label: 'Library Budget Memo',
            snippet: 'Any new program would require careful staffing and equipment planning.',
            fit: 1
          },
          {
            id: 'C',
            label: 'Vintage Typewriter Exhibit',
            snippet: 'Visitors enjoy looking at old newsroom tools in the library foyer.',
            fit: 0
          },
          {
            id: 'D',
            label: 'Civic Engagement Report',
            snippet: 'Students who produce community journalism become more likely to follow local policy debates.',
            fit: 2
          }
        ],
        commentaryOptions: [
          {
            label: 'Use Source A to establish demand and Source D to argue that journalism practice builds long-term civic participation.',
            quality: 'strong',
            feedback: 'Exactly. That is a purposeful synthesis move with a clear line of reasoning.'
          },
          {
            label: 'Use Source C because journalism and typewriters are historically connected.',
            quality: 'flawed',
            feedback: 'Interesting history, but not useful support for this claim.'
          },
          {
            label: 'Use Source A, then note Source B as a realistic challenge a proposal should address.',
            quality: 'weak',
            feedback: 'Solid, but less persuasive than pairing the two strongest supporting sources.'
          }
        ]
      }
    ]
  };

  // Add more arenas by following the same structure: three to five rounds plus one boss.
  const arenas = [
    {
      id: 'audience-arena',
      name: 'Audience Arena',
      theme: 'Read the room before you try to rule it.',
      focus: 'Rhetorical situation',
      accent: 'var(--teal)',
      rounds: [
        {
          id: 'audience-1',
          title: 'Speaker Scan',
          mechanic: 'snap',
          timer: 45,
          items: ['snap1', 'snap5', 'snap8'],
          coach: 'Fast reads, clean audience awareness. No overthinking detours.'
        },
        {
          id: 'audience-2',
          title: 'Purpose Pulse',
          mechanic: 'snap',
          timer: 50,
          items: ['snap2', 'snap6', 'snap4'],
          coach: 'Find what the speaker wants the audience to do or believe.'
        },
        {
          id: 'audience-3',
          title: 'Context Crossfire',
          mechanic: 'snap',
          timer: 55,
          items: ['snap3', 'snap7', 'snap5'],
          coach: 'Exigence and context are the hidden engines. Read for pressure.'
        }
      ],
      bossId: 'boss-audience'
    },
    {
      id: 'claim-forge',
      name: 'Claim Forge',
      theme: 'Build arguments that can survive contact with reality.',
      focus: 'Claims and commentary',
      accent: 'var(--coral)',
      rounds: [
        {
          id: 'claim-1',
          title: 'Thesis Heat',
          mechanic: 'claimChaos',
          timer: 55,
          items: ['claim1', 'claim2', 'claim3', 'claim4'],
          coach: 'Claims take positions. Evidence proves. Commentary explains. Keep them separate.'
        },
        {
          id: 'claim-2',
          title: 'Chaos Sort',
          mechanic: 'claimChaos',
          timer: 60,
          items: ['claim5', 'claim6', 'claim7', 'claim8'],
          coach: 'Weak claims sound opinionated but collapse under detail. Spot them fast.'
        },
        {
          id: 'claim-3',
          title: 'Audience Remix',
          mechanic: 'snap',
          timer: 50,
          items: ['snap2', 'snap8', 'snap6'],
          coach: 'Even a strong claim has to meet its audience without fumbling the purpose.'
        }
      ],
      bossId: 'boss-claim'
    },
    {
      id: 'evidence-lab',
      name: 'Evidence Lab',
      theme: 'Good proof does more than sound related.',
      focus: 'Claims and evidence',
      accent: 'var(--gold)',
      rounds: [
        {
          id: 'evidence-1',
          title: 'Proof Pressure',
          mechanic: 'evidence',
          timer: 60,
          items: ['evidence1', 'evidence2', 'evidence3'],
          coach: 'Pick the evidence that actually proves the claim, not the one that merely visits it.'
        },
        {
          id: 'evidence-2',
          title: 'Support Scan',
          mechanic: 'evidence',
          timer: 65,
          items: ['evidence4', 'evidence5', 'evidence6'],
          coach: 'Direct relevance beats colorful trivia every single time.'
        },
        {
          id: 'evidence-3',
          title: 'Claim Fuel',
          mechanic: 'claimChaos',
          timer: 58,
          items: ['claim1', 'claim6', 'claim3', 'claim8'],
          coach: 'Remember what the proof is supposed to serve.'
        }
      ],
      bossId: 'boss-evidence'
    },
    {
      id: 'logic-tower',
      name: 'Logic Tower',
      theme: 'Random good points are not a line of reasoning.',
      focus: 'Reasoning and organization',
      accent: 'var(--sky)',
      rounds: [
        {
          id: 'logic-1',
          title: 'Reason Run',
          mechanic: 'logic',
          timer: 72,
          items: ['logic1', 'logic2'],
          coach: 'Sequence matters. Build from claim to proof to response to close.'
        },
        {
          id: 'logic-2',
          title: 'Counterweight',
          mechanic: 'logic',
          timer: 78,
          items: ['logic3', 'logic4'],
          coach: 'A smart argument anticipates resistance before the ending lands.'
        },
        {
          id: 'logic-3',
          title: 'Proof Bridge',
          mechanic: 'evidence',
          timer: 62,
          items: ['evidence6', 'evidence7', 'evidence8'],
          coach: 'Better reasoning starts with evidence choices that can actually carry weight.'
        }
      ],
      bossId: 'boss-logic'
    },
    {
      id: 'style-studio',
      name: 'Style Studio',
      theme: 'Revision is where weak thinking stops hiding.',
      focus: 'Style',
      accent: 'var(--rose)',
      rounds: [
        {
          id: 'style-1',
          title: 'Precision Patch',
          mechanic: 'style',
          timer: 60,
          items: ['style1', 'style2', 'style3'],
          coach: 'Choose the revision that does real rhetorical work.'
        },
        {
          id: 'style-2',
          title: 'Diction Dash',
          mechanic: 'style',
          timer: 66,
          items: ['style4', 'style5', 'style6'],
          coach: 'Sharper diction, tighter syntax, stronger effect.'
        },
        {
          id: 'style-3',
          title: 'Audience Polish',
          mechanic: 'snap',
          timer: 54,
          items: ['snap4', 'snap7', 'snap2'],
          coach: 'Style is never floating alone. It always serves a speaker and purpose.'
        }
      ],
      bossId: 'boss-style'
    },
    {
      id: 'fallacy-pit',
      name: 'Fallacy Pit',
      theme: 'Bad logic talks big until somebody names it.',
      focus: 'Reasoning',
      accent: 'var(--lime)',
      rounds: [
        {
          id: 'fallacy-1',
          title: 'Bad Faith Brawl',
          mechanic: 'fallacy',
          timer: 60,
          items: ['fallacy1', 'fallacy2', 'fallacy3'],
          coach: 'Name the flawed move fast. Precision beats vague skepticism.'
        },
        {
          id: 'fallacy-2',
          title: 'Trapdoor Debate',
          mechanic: 'fallacy',
          timer: 65,
          items: ['fallacy4', 'fallacy5', 'fallacy6'],
          coach: 'A good critic knows exactly where the logic breaks.'
        },
        {
          id: 'fallacy-3',
          title: 'Reason Shield',
          mechanic: 'logic',
          timer: 80,
          items: ['logic5', 'logic6'],
          coach: 'Strong reasoning is the best defense against bad reasoning.'
        }
      ],
      bossId: 'boss-fallacy'
    },
    {
      id: 'synthesis-summit',
      name: 'Synthesis Summit',
      theme: 'Sources are ingredients, not confetti.',
      focus: 'Synthesis',
      accent: 'var(--teal)',
      rounds: [
        {
          id: 'synthesis-1',
          title: 'Source Circuit',
          mechanic: 'synthesis',
          timer: 82,
          items: ['synth1', 'synth2'],
          coach: 'Select sources that support each other, not just the topic.'
        },
        {
          id: 'synthesis-2',
          title: 'Line Link',
          mechanic: 'synthesis',
          timer: 88,
          items: ['synth3', 'synth4'],
          coach: 'The reasoning between sources matters as much as the sources themselves.'
        },
        {
          id: 'synthesis-3',
          title: 'Evidence Refresh',
          mechanic: 'evidence',
          timer: 66,
          items: ['evidence2', 'evidence5', 'evidence8'],
          coach: 'Strong synthesis still depends on spotting high-value evidence.'
        }
      ],
      bossId: 'boss-synthesis'
    },
    {
      id: 'final-exam-gauntlet',
      name: 'Final Exam Gauntlet',
      theme: 'Everything you know, under pressure, with no sympathy timer.',
      focus: 'Mixed mastery',
      accent: 'var(--gold)',
      rounds: [
        {
          id: 'final-1',
          title: 'Purpose Shock',
          mechanic: 'snap',
          timer: 52,
          items: ['snap1', 'snap3', 'snap6'],
          coach: 'Read the rhetorical situation before the scene can fake you out.'
        },
        {
          id: 'final-2',
          title: 'Argument Pulse',
          mechanic: 'claimChaos',
          timer: 60,
          items: ['claim1', 'claim5', 'claim7', 'claim8'],
          coach: 'Separate the argument parts cleanly. Messy classification wrecks essays.'
        },
        {
          id: 'final-3',
          title: 'Source Finish',
          mechanic: 'synthesis',
          timer: 90,
          items: ['synth5', 'synth6'],
          coach: 'Final stretch. Support plus commentary plus structure.'
        }
      ],
      bossId: 'boss-final'
    }
  ];

  const bosses = [
    {
      id: 'boss-audience',
      arenaId: 'audience-arena',
      name: 'Principal\'s Podium',
      intro: 'Dean Static: The podium only opens for speakers who can read pressure, audience, and purpose without blinking.',
      timer: 100,
      stages: [
        { mechanic: 'snap', itemId: 'snap5', label: 'Budget Room Read' },
        { mechanic: 'snap', itemId: 'snap3', label: 'Crisis Exigence' },
        { mechanic: 'claimChaos', itemId: 'claim4', label: 'Commentary Check' },
        { mechanic: 'style', itemId: 'style1', label: 'Authority Revision' }
      ]
    },
    {
      id: 'boss-claim',
      arenaId: 'claim-forge',
      name: 'The Thesis Warden',
      intro: 'Ivy Voss: Anyone can have opinions. Let\'s see whether yours survive classification.',
      timer: 105,
      stages: [
        { mechanic: 'claimChaos', itemId: 'claim1', label: 'Claim Core' },
        { mechanic: 'claimChaos', itemId: 'claim7', label: 'Evidence Check' },
        { mechanic: 'snap', itemId: 'snap8', label: 'Audience Fit' },
        { mechanic: 'evidence', itemId: 'evidence4', label: 'Proof Lock' }
      ]
    },
    {
      id: 'boss-evidence',
      arenaId: 'evidence-lab',
      name: 'Data Hydra',
      intro: 'Coach Margot: Cut off weak proof. Keep the evidence that actually bites.',
      timer: 110,
      stages: [
        { mechanic: 'evidence', itemId: 'evidence1', label: 'Transit Proof' },
        { mechanic: 'evidence', itemId: 'evidence6', label: 'Learning Proof' },
        { mechanic: 'claimChaos', itemId: 'claim8', label: 'Commentary Pulse' },
        { mechanic: 'logic', itemId: 'logic1', label: 'Reason Chain' }
      ]
    },
    {
      id: 'boss-logic',
      arenaId: 'logic-tower',
      name: 'Architect Zero',
      intro: 'Dean Static: Good ideas in bad order still lose. Build clean or fall loudly.',
      timer: 120,
      stages: [
        { mechanic: 'logic', itemId: 'logic2', label: 'Structure Climb' },
        { mechanic: 'evidence', itemId: 'evidence5', label: 'Support Beam' },
        { mechanic: 'logic', itemId: 'logic4', label: 'Counterargument Turn' },
        { mechanic: 'style', itemId: 'style5', label: 'Nuance Finish' }
      ]
    },
    {
      id: 'boss-style',
      arenaId: 'style-studio',
      name: 'Editor Revenant',
      intro: 'Ivy Voss: Weak sentences never really die. They linger until someone revises them properly.',
      timer: 105,
      stages: [
        { mechanic: 'style', itemId: 'style2', label: 'Concision Cut' },
        { mechanic: 'style', itemId: 'style6', label: 'Diction Strike' },
        { mechanic: 'snap', itemId: 'snap2', label: 'Purpose Read' },
        { mechanic: 'evidence', itemId: 'evidence3', label: 'Support Polish' }
      ]
    },
    {
      id: 'boss-fallacy',
      arenaId: 'fallacy-pit',
      name: 'Lord Strawman',
      intro: 'Dean Static: The Pit rewards accuracy. Call the fallacy, not just the vibe.',
      timer: 110,
      stages: [
        { mechanic: 'fallacy', itemId: 'fallacy5', label: 'Domino Break' },
        { mechanic: 'fallacy', itemId: 'fallacy8', label: 'Misread Crush' },
        { mechanic: 'logic', itemId: 'logic6', label: 'Line Rebuild' },
        { mechanic: 'style', itemId: 'style3', label: 'Commentary Repair' }
      ]
    },
    {
      id: 'boss-synthesis',
      arenaId: 'synthesis-summit',
      name: 'Source Storm',
      intro: 'Coach Margot: Anyone can quote. Synthesis is choosing, connecting, and landing the claim.',
      timer: 125,
      stages: [
        { mechanic: 'synthesis', itemId: 'synth2', label: 'Sleep Stack' },
        { mechanic: 'evidence', itemId: 'evidence8', label: 'Participation Proof' },
        { mechanic: 'synthesis', itemId: 'synth6', label: 'Connection Burst' },
        { mechanic: 'logic', itemId: 'logic7', label: 'Reason Finish' }
      ]
    },
    {
      id: 'boss-final',
      arenaId: 'final-exam-gauntlet',
      name: 'The Examiner',
      intro: 'Dean Static: Final gate. Every skill counts, every hesitation echoes, and Ivy is definitely watching.',
      timer: 140,
      stages: [
        { mechanic: 'snap', itemId: 'snap7', label: 'Context Lock' },
        { mechanic: 'claimChaos', itemId: 'claim6', label: 'Claim Core' },
        { mechanic: 'evidence', itemId: 'evidence2', label: 'Proof Select' },
        { mechanic: 'logic', itemId: 'logic8', label: 'Line Build' },
        { mechanic: 'style', itemId: 'style8', label: 'Final Revision' },
        { mechanic: 'synthesis', itemId: 'synth8', label: 'Source Crown' }
      ]
    }
  ];

  return {
    categories: categories,
    mechanics: mechanics,
    titles: titles,
    arenas: arenas,
    bosses: bosses,
    content: content,
    announcerLines: announcerLines
  };
})();
